-- Persist the daily "waar heb je behoefte aan" answer used by Vandaag
-- recommendations. The app already reads/writes this column; the schema
-- was missing the matching migration.

alter table public.daily_checkins
  add column if not exists need text
  check (
    need is null
    or need in ('rust', 'beweging', 'voeding', 'energie', 'mezelf')
  );

comment on column public.daily_checkins.need is
  'Optional daily need from the Vandaag picker; steers recommendations.';

-- Wave 2 + 3: reminders, medication box, diary, knowledge library,
-- and short mental/sleep workouts.

-- =========================================================
-- PROFILE REMINDER PREFERENCES
-- =========================================================
alter table public.profiles
  add column if not exists checkin_reminder_enabled boolean not null default false,
  add column if not exists checkin_reminder_time time not null default '09:00',
  add column if not exists workout_reminder_enabled boolean not null default false,
  add column if not exists browser_notifications_enabled boolean not null default false;

comment on column public.profiles.checkin_reminder_enabled is
  'Opt-in daily check-in reminder (shown via in-app / browser notification).';
comment on column public.profiles.workout_reminder_enabled is
  'Opt-in reminder when today is a planned movement day and nothing is logged yet.';

-- =========================================================
-- MEDICATION / SUPPLEMENT BOX
-- =========================================================
create table if not exists public.medications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  notes text,
  reminder_time time,
  reminder_enabled boolean not null default true,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists medications_user_id_idx on public.medications(user_id);

create table if not exists public.medication_intakes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  medication_id uuid not null references public.medications(id) on delete cascade,
  date date not null,
  taken_at timestamptz not null default now(),
  unique (user_id, medication_id, date)
);

create index if not exists medication_intakes_user_date_idx
  on public.medication_intakes(user_id, date desc);

alter table public.medications enable row level security;
alter table public.medication_intakes enable row level security;

create policy "medications_select_own" on public.medications for select using (auth.uid() = user_id);
create policy "medications_insert_own" on public.medications for insert with check (auth.uid() = user_id);
create policy "medications_update_own" on public.medications for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "medications_delete_own" on public.medications for delete using (auth.uid() = user_id);

create policy "medication_intakes_select_own" on public.medication_intakes for select using (auth.uid() = user_id);
create policy "medication_intakes_insert_own" on public.medication_intakes for insert with check (auth.uid() = user_id);
create policy "medication_intakes_update_own" on public.medication_intakes for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "medication_intakes_delete_own" on public.medication_intakes for delete using (auth.uid() = user_id);

-- =========================================================
-- DIARY
-- =========================================================
create table if not exists public.diary_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default (timezone('utc', now()))::date,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists diary_entries_user_date_idx
  on public.diary_entries(user_id, date desc);

alter table public.diary_entries enable row level security;

create policy "diary_entries_select_own" on public.diary_entries for select using (auth.uid() = user_id);
create policy "diary_entries_insert_own" on public.diary_entries for insert with check (auth.uid() = user_id);
create policy "diary_entries_update_own" on public.diary_entries for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "diary_entries_delete_own" on public.diary_entries for delete using (auth.uid() = user_id);

-- =========================================================
-- KNOWLEDGE ARTICLES
-- =========================================================
create table if not exists public.knowledge_articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null,
  body text not null,
  category text not null,
  tags text[] not null default '{}',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists knowledge_articles_category_idx on public.knowledge_articles(category);

alter table public.knowledge_articles enable row level security;

create policy "knowledge_articles_select_all"
  on public.knowledge_articles for select
  to authenticated
  using (true);

-- Seed lean overgang / hormoon knowledge (idempotent)
do $$
begin
  if (select count(*) from public.knowledge_articles) > 0 then
    return;
  end if;

  insert into public.knowledge_articles (slug, title, summary, body, category, tags, sort_order) values
  (
    'wat-verandert-er-rondom-de-overgang',
    'Wat verandert er rondom de overgang?',
    'Hormonen zoals oestrogeen en progesteron verschuiven geleidelijk. Dat kan invloed hebben op energie, slaap, stemming en cyclus.',
    E'De overgang is geen plotselinge knop, maar een traject dat jaren kan duren. In de perimenopauze (de jaren ervoor) kan je cyclus onregelmatiger worden, terwijl klachten al speel kunnen zijn.\n\nVeelvoorkomende signalen: veranderende menstruatie, opvliegers, nachtelijk zweten, slechter slapen, stemmingswisselingen, brain fog of een ander gevoel in je lijf.\n\nBelangrijk: elke vrouw ervaart dit anders. Wat jij bijhoudt in Cyclus helpt je patronen te herkennen — zonder dat het een diagnose is.\n\nWat je zelf kunt doen: regelmatig slapen, bewegen op jouw tempo, eiwitrijke voeding en stressmomenten serieus nemen. Bij aanhoudende of hevige klachten: praat met je huisarts of gynaecoloog.',
    'overgang',
    array['overgang','hormonen','perimenopauze'],
    10
  ),
  (
    'veelvoorkomende-klachten',
    'Veelvoorkomende klachten — en wat ze kunnen betekenen',
    'Opvliegers, slechte slaap, brain fog of een kort lontje komen vaak voor. Herkenning is de eerste stap.',
    E'Klachten rondom hormonale veranderingen zijn reëel, ook als bloedonderzoek “normaal” lijkt. Veel vrouwen voelen zich eerst niet serieus genomen.\n\nHoud bij: wanneer het speelt, hoe heftig, en wat je die dag verder deed (slaap, stress, beweging). Dat maakt een gesprek met een arts concreter.\n\nCyclus is geen medische test. Wél een plek om je verhaal scherp te krijgen.',
    'klachten',
    array['klachten','opvliegers','slaap'],
    20
  ),
  (
    'slaap-en-hormonen',
    'Slaap en hormonen',
    'Slechte slaap versterkt vaak andere klachten. Een stabiel ritme helpt je lichaam herstellen.',
    E'Tijdens de slaap reguleert je lichaam herstel- en stresshormonen. Rondom de overgang slapen veel vrouwen lichter of wakker worden ze vaker.\n\nPraktisch: vaste bedtijden, minder cafeïne na de middag, koeler slapen bij nachtelijk zweten, en een kort ontspanningsritueel.\n\nIn Cyclus kun je slaap scoren in je check-in. Als je een patroon ziet met klachten, neem dat mee naar je arts.',
    'slaap',
    array['slaap','herstel'],
    30
  ),
  (
    'stemming-stress-en-je-hoofd',
    'Stemming, stress en je hoofd',
    'Hormonen, slaaptekort en stress versterken elkaar. Kleine resets helpen meer dan “gewoon doorgaan”.',
    E'Een korter lontje of brain fog betekent niet dat je “fout” bezig bent. Het kan een signaal zijn dat je systeem overvraagd is.\n\nHelpend: korte ademoefeningen, wandelen, grenzen aangeven, en niet alles alleen willen oplossen.\n\nZoek professionele hulp bij aanhoudende somberheid, paniek of gedachten die eng voelen. Buddy en kennis in de app zijn geen vervanging voor zorg.',
    'mentaal',
    array['stemming','stress','mentaal'],
    40
  ),
  (
    'beweging-die-past',
    'Beweging die past bij jouw dag',
    'Niet harder, maar slimmer: kracht, wandelen en mobiliteit op dagen dat het kan — en rust als dat beter is.',
    E'Beweging ondersteunt botten, stemming, slaap en energie. Op zware dagen is zachte mobiliteit of een korte wandeling genoeg.\n\nCyclus past voorstellen aan op je check-in en (indien bekend) je cyclusfase. Jij houdt het veto.',
    'beweging',
    array['beweging','kracht','herstel'],
    50
  ),
  (
    'voeding-als-steun',
    'Voeding als steun, geen dieetdwang',
    'Eiwitten, vezels en regelmaat helpen energie stabieler te houden — zonder strikte regels.',
    E'Rondom hormonale veranderingen profiteren veel vrouwen van voldoende eiwit, vezels en minder schommelende bloedsuiker.\n\nDenk aan: eiwit bij elke maaltijd, groenten/peulvruchten, en snelle opties voor lage-energie dagen. Geen wonderkuur — wél haalbare steun.',
    'voeding',
    array['voeding','energie'],
    60
  ),
  (
    'wanneer-naar-de-arts',
    'Wanneer naar de arts?',
    'Bij hevige, aanhoudende of verontrustende klachten hoort professionele zorg. Jouw notities maken dat gesprek sterker.',
    E'Neem contact op met je huisarts of gynaecoloog bij hevig bloedverlies, plotselinge erge pijn, aanhoudende somberheid, of klachten die je dagelijks functioneren sterk beperken.\n\nNeem mee: cyclusveranderingen, topklachten, slaap/energie-trends en wat je al hebt geprobeerd. In Cyclus vind je daarvoor een samenvatting onder Cyclus.',
    'zorg',
    array['arts','zorg'],
    70
  ),
  (
    'hormoontherapie-hoog-niveau',
    'Hormoontherapie — alleen als overzicht',
    'HRT/MHT bestaat en kan voor sommige vrouwen passend zijn. Of het bij jou past, beslis je mét een arts.',
    E'Hormoontherapie (ook wel menopauzale hormoontherapie) is één van de opties bij overgangsklachten. Het is géén standaard voor iedereen en geen iets om zelf te doseren.\n\nAndere routes kunnen voeding, beweging, slaap, psychologische steun of andere behandelingen zijn. Vraag je arts naar voor- en nadelen in jouw situatie.\n\nCyclus geeft geen medisch advies en schrijft niets voor.',
    'zorg',
    array['HRT','hormoontherapie','overgang'],
    80
  ),
  (
    'werk-en-prive',
    'Werk, privé en grenzen',
    'Klachten raken concentratie en energie — grenzen en kleine aanpassingen maken verschil.',
    E'Veel vrouwen merken impact op werk: focus, slaaptekort, opvliegers in meetings. Je hoeft niet alles te delen, maar wel ruimte te vragen waar dat kan: pauzes, temperatuur, planning.\n\nThuis: dezelfde logica. Rust is productief als je systeem herstelt.',
    'prive',
    array['werk','grenzen','prive'],
    90
  ),
  (
    'intimiteit-en-je-lijf',
    'Intimiteit en je lijf',
    'Veranderingen in libido of comfort komen voor. Je mag dit benoemen — bij je partner én bij een zorgverlener.',
    E'Hormonen, slaap en stemming beïnvloeden intimiteit. Droogheid, pijn of minder zin zijn bespreekbaar met huisarts, gynaecoloog of seksuoloog.\n\nGeen schaamte-onderwerp. Wél iets wat bij jouw gezondheid hoort.',
    'prive',
    array['intimiteit','prive'],
    100
  );
end $$;

-- =========================================================
-- MENTAL / SLEEP SHORT WORKOUTS (idempotent by title)
-- =========================================================
do $$
declare
  wid uuid;
begin
  if not exists (select 1 from public.workouts where title = 'Ademreset 4 minuten') then
    insert into public.workouts (title, type, duration, difficulty, description)
    values (
      'Ademreset 4 minuten',
      'mobiliteit',
      4,
      'makkelijk',
      'Een korte ademhalingsoefening om spanning te laten zakken.'
    ) returning id into wid;

    insert into public.exercises (workout_id, name, muscle_group, instructions, steps, sets, reps, order_index, why_it_helps, common_mistakes, fun_fact)
    values
    (wid, 'Zacht landen', 'ademhaling', 'Ga comfortabel zitten of staan. Schouders laag.',
      '["Zoek een rustige houding.","Laat je schouders zakken.","Sluit je ogen als dat fijn voelt."]',
      1, '30 sec', 1,
      'Een korte landingsfase helpt je zenuwstelsel schakelen van doen naar rust.',
      'Meteen forceren om “leeg” te zijn in je hoofd.',
      'Wist je dat alleen al gaan zitten je ademhaling vaak al vertraagt?'),
    (wid, '4-6 ademhaling', 'ademhaling', 'Adem 4 tellen in, 6 tellen uit. Herhaal.',
      '["Adem rustig in door je neus (tel tot 4).","Adem langer uit (tel tot 6).","Herhaal zonder te forceren."]',
      1, '150 sec', 2,
      'Een langere uitademing kan helpen om spanning te verlagen.',
      'De adem hoog in de borst houden of hyperventileren.',
      'Wist je dat je uitademing sterker gekoppeld is aan ontspanning dan je inademing?'),
    (wid, 'Afronden', 'ademhaling', 'Open je ogen en merk één ding op dat anders voelt.',
      '["Neem nog één rustige ademteug.","Open je ogen.","Noem voor jezelf één klein verschil."]',
      1, '30 sec', 3,
      'Afronden maakt de oefening af zodat je het gevoel meeneemt.',
      'Meteen je telefoon weer oppakken zonder overgang.',
      null);
  end if;

  if not exists (select 1 from public.workouts where title = 'Body scan 6 minuten') then
    insert into public.workouts (title, type, duration, difficulty, description)
    values (
      'Body scan 6 minuten',
      'mobiliteit',
      6,
      'makkelijk',
      'Scan je lichaam van voet tot kruin zonder iets te hoeven fixen.'
    ) returning id into wid;

    insert into public.exercises (workout_id, name, muscle_group, instructions, steps, sets, reps, order_index, why_it_helps, common_mistakes, fun_fact)
    values
    (wid, 'Lig of zit comfortabel', 'ontspanning', 'Kies een houding waarin je 6 minuten kunt blijven.',
      '["Ga liggen of zitten.","Steun je lichaam goed.","Laat je handen rusten."]',
      1, '40 sec', 1,
      'Comfort vermindert afleiding zodat je aandacht bij je lijf kan blijven.',
      'In een houding gaan die je al snel pijn doet.',
      null),
    (wid, 'Scan van voet naar kruin', 'ontspanning', 'Verplaats je aandacht langzaam omhoog.',
      '["Begin bij je voeten.","Ga via benen, buik, borst, armen naar je gezicht.","Merk spanning op zonder te forceren."]',
      1, '260 sec', 2,
      'Aandacht bij het lichaam kan rumineren in je hoofd even onderbreken.',
      'Oordelen over wat je voelt (“dit hoort niet”).',
      'Wist je dat een body scan vaak gebruikt wordt bij stressreductie-trainingen?'),
    (wid, 'Terug naar de ruimte', 'ontspanning', 'Beweeg vingers en tenen, open je ogen.',
      '["Beweeg je vingers en tenen.","Rek zacht uit.","Kom rustig terug."]',
      1, '40 sec', 3,
      'Een zachte overgang voorkomt een abrupt einde.',
      null,
      null);
  end if;

  if not exists (select 1 from public.workouts where title = 'Slaapritueel 8 minuten') then
    insert into public.workouts (title, type, duration, difficulty, description)
    values (
      'Slaapritueel 8 minuten',
      'mobiliteit',
      8,
      'makkelijk',
      'Een kort ritueel om je avond af te ronden en je lijf richting rust te brengen.'
    ) returning id into wid;

    insert into public.exercises (workout_id, name, muscle_group, instructions, steps, sets, reps, order_index, why_it_helps, common_mistakes, fun_fact)
    values
    (wid, 'Scherm even weg', 'slaap', 'Leg je telefoon op stil of buiten bereik.',
      '["Zet meldingen stil.","Duw licht lager als dat kan.","Kies één kalme plek."]',
      1, '60 sec', 1,
      'Minder prikkels helpt je brein omschakelen naar slaap.',
      'Nog “snel even” scrollen.',
      null),
    (wid, 'Loslaten in schouders en kaak', 'slaap', 'Adem uit en laat schouders en kaak zakken.',
      '["Adem in.","Adem uit en laat schouders zakken.","Ontspan je kaak en tong."]',
      1, '180 sec', 2,
      'Veel spanning zit in kaak en schouders — loslaten signaleert veiligheid.',
      'De tanden op elkaar klemmen tijdens “ontspannen”.',
      null),
    (wid, 'Drie dankbare notities', 'slaap', 'Noem drie kleine dingen van vandaag.',
      '["Bedenk drie kleine dingen die oké waren.","Houd het eenvoudig.","Sluit af met een rustige ademteug."]',
      1, '120 sec', 3,
      'Aandacht voor kleine oké-momenten kan piekeren verminderen.',
      'Het forceren van grote dankbaarheid.',
      null),
    (wid, 'Klaar voor bed', 'slaap', 'Ga naar bed of doe je laatste avondstap.',
      '["Rei je toe op slapen.","Houd licht laag.","Gun jezelf een trage overgang."]',
      1, '60 sec', 4,
      'Een vaste afronding train je lichaam dat slaap eraan komt.',
      null,
      null);
  end if;

  if not exists (select 1 from public.workouts where title = 'Kort lontje reset 5 minuten') then
    insert into public.workouts (title, type, duration, difficulty, description)
    values (
      'Kort lontje reset 5 minuten',
      'mobiliteit',
      5,
      'makkelijk',
      'Voor als alles te veel voelt: grounding + adem, zonder oordeel.'
    ) returning id into wid;

    insert into public.exercises (workout_id, name, muscle_group, instructions, steps, sets, reps, order_index, why_it_helps, common_mistakes, fun_fact)
    values
    (wid, '5 dingen die je ziet', 'gronding', 'Noem vijf dingen die je om je heen ziet.',
      '["Kijk om je heen.","Noem vijf zichtbare dingen.","Houd het feitelijk."]',
      1, '60 sec', 1,
      'Gronden in je omgeving haalt je even uit piekeren of oplopende irritatie.',
      'Doorgaan in je hoofd terwijl je “kijkt”.',
      null),
    (wid, 'Voeten op de grond', 'gronding', 'Voel je voeten of zitvlak stevig steunen.',
      '["Plant je voeten of voel je stoel.","Druk zacht aan.","Adem één keer dieper uit."]',
      1, '90 sec', 2,
      'Lichamelijke steun signalen veiligheid aan je zenuwstelsel.',
      null,
      null),
    (wid, 'Zachte uitademing', 'ademhaling', 'Drie langere uitademingen.',
      '["Adem in door je neus.","Adem langer uit.","Herhaal drie keer."]',
      1, '90 sec', 3,
      'Een langere uitademing kan piekspanning laten dalen.',
      null,
      null),
    (wid, 'Eén zin voor jezelf', 'mentaal', 'Kies één milde zin, bijvoorbeeld: “Dit mag even minder.”',
      '["Kies één milde zin.","Zeg hem stil of zacht.","Ga daarna door met wat nodig is."]',
      1, '60 sec', 4,
      'Een milde zin doorbreekt harde zelfspraak.',
      'Jezelf dwingen tot positief denken.',
      null);
  end if;

  if not exists (select 1 from public.workouts where title = 'Wandeling met aandacht 10 minuten') then
    insert into public.workouts (title, type, duration, difficulty, description)
    values (
      'Wandeling met aandacht 10 minuten',
      'wandelen',
      10,
      'makkelijk',
      'Een korte wandeling waarbij je tempo en adem belangrijker zijn dan stappen tellen.'
    ) returning id into wid;

    insert into public.exercises (workout_id, name, muscle_group, instructions, steps, sets, reps, order_index, why_it_helps, common_mistakes, fun_fact)
    values
    (wid, 'Stap naar buiten of de gang', 'wandelen', 'Kies een veilige, haalbare route.',
      '["Kies een korte route.","Laat je telefoon bij voorkeur weg.","Start in een rustig tempo."]',
      1, '60 sec', 1,
      'Alleen al van plek wisselen kan stemming en focus beïnvloeden.',
      null,
      null),
    (wid, 'Loop op ademtempo', 'wandelen', 'Pas je tempo aan je adem aan.',
      '["Loop rustig.","Merk je adem op.","Als je hoofd vol is: tel stappen tot 10 en herhaal."]',
      1, '420 sec', 2,
      'Matige beweging + aandacht is een toegankelijke stressbuffer.',
      'Hardlopen terwijl je uitputting voelt.',
      null),
    (wid, 'Kom terug', 'wandelen', 'Eindig met één bewuste ademteug binnen.',
      '["Kom binnen of rond af.","Neem één bewuste ademteug.","Drink wat water."]',
      1, '60 sec', 3,
      'Afronden helpt het effect “landen”.',
      null,
      null);
  end if;
end $$;
