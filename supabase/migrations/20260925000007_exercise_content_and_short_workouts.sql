-- Backfill rich explanation content for existing exercises, and add a
-- handful of short (5-10 min) workouts so the weekly program generator has
-- something to offer on busy days.

-- =========================================================
-- Krachttraining - Full Body
-- =========================================================
update public.exercises set
  steps = '["Ga staan met je voeten heupbreedte uit elkaar, tenen wijzen licht naar buiten.","Buig je knieën en zak naar achteren alsof je op een stoel gaat zitten, houd je borst omhoog.","Zak tot je bovenbenen ongeveer evenwijdig aan de grond zijn (of zo diep als comfortabel is).","Duw door je hielen omhoog terug naar de startpositie."]',
  why_it_helps = 'Squats trainen je bovenbenen en billen — de grootste spiergroepen van je lichaam — en zijn direct te vertalen naar dagelijkse bewegingen zoals opstaan uit een stoel.',
  common_mistakes = 'Knieën naar binnen laten zakken, of de rug bol maken tijdens het zakken.',
  fun_fact = 'Wist je dat squats de spieren trainen die je elke dag gebruikt om te zitten en op te staan? Sterke beenspieren dragen bij aan zelfstandigheid op elke leeftijd.'
where name = 'Squats';

update public.exercises set
  steps = '["Start op je tenen of knieën, handen iets breder dan schouderbreedte.","Houd een rechte lijn van hoofd tot hielen (of knieën).","Laat je borst gecontroleerd richting de grond zakken.","Duw jezelf terug omhoog naar de startpositie."]',
  why_it_helps = 'Push-ups trainen borst, schouders en armen tegelijk en bouwen functionele bovenlichaamskracht op zonder gewichten nodig te hebben.',
  common_mistakes = 'Heupen laten doorzakken of juist omhoog steken in plaats van een rechte lijn aanhouden.',
  fun_fact = 'Wist je dat je de push-up makkelijker of moeilijker kunt maken door je handen dichter bij of verder van je heupen te plaatsen (op de knieën)?'
where name = 'Push-ups';

update public.exercises set
  steps = '["Pak de weerstandsband of het gewicht vast en buig licht door je knieën.","Buig voorover vanuit je heupen met een rechte rug.","Trek de band of het gewicht naar je middel, knijp je schouderbladen naar elkaar toe.","Laat gecontroleerd weer los naar de startpositie."]',
  why_it_helps = 'Rows trainen je rugspieren, wat helpt bij een betere houding en tegenwicht biedt aan veel zittend werk.',
  common_mistakes = 'Alleen met de armen trekken in plaats van de schouderbladen actief samen te knijpen.',
  fun_fact = 'Wist je dat sterke rugspieren kunnen bijdragen aan minder last van een ronde rug tijdens lange werkdagen?'
where name = 'Rows met weerstandsband of gewicht';

update public.exercises set
  steps = '["Lig op je rug met je knieën gebogen, voeten plat op de grond.","Druk door je hielen en til je heupen omhoog tot je van schouders tot knieën een rechte lijn vormt.","Knijp je bilspieren bovenaan samen.","Laat je heupen gecontroleerd weer zakken."]',
  why_it_helps = 'De glute bridge activeert je bilspieren, die een belangrijke rol spelen bij het stabiliseren van je bekken en het ondersteunen van je onderrug.',
  common_mistakes = 'Vooral je onderrug gebruiken om omhoog te duwen in plaats van je bilspieren.',
  fun_fact = 'Wist je dat je bilspieren de grootste spiergroep in je lichaam zijn en een sleutelrol spelen bij lopen, traplopen en opstaan?'
where name = 'Glute bridge';

update public.exercises set
  steps = '["Steun op je onderarmen en tenen, ellebogen onder je schouders.","Span je buikspieren aan en houd een rechte lijn van hoofd tot hielen.","Adem rustig door terwijl je de houding vasthoudt.","Laat gecontroleerd los als je vorm verslechtert."]',
  why_it_helps = 'De plank traint je hele core, die je lichaam stabiliseert bij bijna elke andere beweging — van tillen tot lopen.',
  common_mistakes = 'Je heupen laten zakken of juist te hoog steken.',
  fun_fact = 'Wist je dat een sterke core kan bijdragen aan minder lage-rugklachten in het dagelijks leven?'
where name = 'Plank';

-- =========================================================
-- Pilates - Core & Stabiliteit
-- =========================================================
update public.exercises set
  steps = '["Lig op je rug, til je hoofd en schouders licht van de mat.","Til je benen op (gestrekt of gebogen, wat comfortabel is).","Pomp je armen kort op en neer naast je lichaam.","Adem in gedurende 5 pompen, adem uit gedurende 5 pompen."]',
  why_it_helps = 'The Hundred verwarmt je core op en traint uithoudingsvermogen in je buikspieren.',
  common_mistakes = 'Je nek spannen in plaats van je borst omhoog houden vanuit je bovenrug.',
  fun_fact = 'Wist je dat deze oefening zijn naam dankt aan de 100 ademhalingen die je in de klassieke Pilates-versie maakt?'
where name = 'The Hundred';

update public.exercises set
  steps = '["Lig op je rug met je armen gestrekt boven je hoofd.","Rol met een bolle rug langzaam omhoog, wervel voor wervel.","Kom tot een zit met je armen richting je tenen.","Rol met dezelfde controle weer terug naar liggend."]',
  why_it_helps = 'De roll-up traint je buikspieren én de beweeglijkheid van je wervelkolom.',
  common_mistakes = 'Met een zwaai omhoog komen in plaats van wervel voor wervel op te rollen.',
  fun_fact = 'Wist je dat een soepele wervelkolom bijdraagt aan een betere houding op elke leeftijd?'
where name = 'Roll-up';

update public.exercises set
  steps = '["Lig op je zij, steun op je onderarm met de elleboog onder je schouder.","Stapel je voeten of plaats de bovenste voet iets voor de onderste.","Til je heupen op tot je lichaam een rechte lijn vormt.","Houd vast en adem rustig door."]',
  why_it_helps = 'Side planks trainen de zijkant van je core, die belangrijk is voor stabiliteit bij zijwaartse bewegingen.',
  common_mistakes = 'Je heupen naar voren of achteren laten draaien in plaats van gestapeld houden.',
  fun_fact = 'Wist je dat je schuine buikspieren je helpen bij bijna elke draaibeweging, zoals achterom kijken in de auto?'
where name = 'Side plank';

update public.exercises set
  steps = '["Lig op je rug, een been gestrekt omhoog, het andere plat op de grond of licht gebogen.","Maak met het opgeheven been een grote, gecontroleerde cirkel.","Houd je bekken stil terwijl je been beweegt.","Wissel na het gekozen aantal herhalingen van been."]',
  why_it_helps = 'Leg circles trainen heupmobiliteit en core-stabiliteit tegelijk.',
  common_mistakes = 'Je bekken laten meebewegen met het been in plaats van je core stabiel te houden.',
  fun_fact = 'Wist je dat een stabiel bekken tijdens beenbewegingen kan bijdragen aan minder last van je onderrug?'
where name = 'Leg circles';

-- =========================================================
-- Yoga Flow - Zachte Beweging
-- =========================================================
update public.exercises set
  steps = '["Kom op handen en knieën, handen onder je schouders, knieën onder je heupen.","Adem in: laat je buik zakken, kijk omhoog (koe).","Adem uit: maak een bolle rug, kin naar je borst (kat).","Herhaal in een rustig tempo op je ademhaling."]',
  why_it_helps = 'Kat-koe brengt rustige beweging in je hele wervelkolom en kan spanning in je rug loslaten.',
  common_mistakes = 'De beweging te snel maken in plaats van deze te koppelen aan je ademhaling.',
  fun_fact = 'Wist je dat je wervelkolom door dit soort zachte bewegingen soepel blijft, wat bijdraagt aan een betere houding?'
where name = 'Kat-koe';

update public.exercises set
  steps = '["Start op handen en knieën, tenen onder je voeten.","Duw je heupen omhoog en achteren, benen mogen licht gebogen blijven.","Laat je hielen richting de mat zakken (ze hoeven de grond niet te raken).","Ontspan je nek en adem rustig door."]',
  why_it_helps = 'Deze houding rekt je hele achterkant — kuiten, hamstrings en rug — en versterkt tegelijk je schouders.',
  common_mistakes = 'Je knieën volledig gestrekt forceren waardoor je rug bol gaat staan.',
  fun_fact = 'Wist je dat deze houding ook wel wordt gebruikt als een korte, actieve rustpositie tussen krachtoefeningen door?'
where name = 'Neerwaartse hond';

update public.exercises set
  steps = '["Kniel op de mat en zak met je billen richting je hielen.","Laat je bovenlichaam voorover zakken tussen je knieën.","Strek je armen naar voren of laat ze naast je lichaam rusten.","Adem rustig door en laat je rug ontspannen."]',
  why_it_helps = 'Kindhouding is een rustpositie die zacht rekt en helpt om tot rust te komen.',
  common_mistakes = 'De houding forceren als je knieën of heupen dit niet comfortabel toelaten — leg dan een kussen tussen je hielen en billen.',
  fun_fact = 'Wist je dat deze houding vaak wordt gebruikt als hersteldmoment tussen andere yogahoudingen door?'
where name = 'Kindhouding';

update public.exercises set
  steps = '["Lig op je rug met je armen gestrekt opzij.","Trek je knieën op richting je borst.","Laat je knieën gecontroleerd naar één kant zakken, hoofd mag de andere kant op kijken.","Kom terug naar het midden en wissel van kant."]',
  why_it_helps = 'Deze zachte torsie brengt beweging in je onderrug en kan spanning daar loslaten.',
  common_mistakes = 'Beide schouders van de mat laten komen in plaats van ze naar de grond gedrukt te houden.',
  fun_fact = 'Wist je dat rotatiebewegingen in je wervelkolom net zo belangrijk zijn als buigen en strekken voor een soepele rug?'
where name = 'Torsie liggend';

-- =========================================================
-- Wandelen - Actief Herstel
-- =========================================================
update public.exercises set
  steps = '["Begin in een ontspannen, rustig tempo.","Laat je armen losjes meebewegen.","Adem rustig door je neus indien mogelijk.","Bouw je tempo langzaam op richting het einde van dit onderdeel."]',
  why_it_helps = 'Rustig opwarmen bereidt je hart, longen en spieren voor op meer inspanning.',
  common_mistakes = 'Direct in een stevig tempo beginnen zonder opbouw.',
  fun_fact = 'Wist je dat wandelen een van de meest toegankelijke vormen van cardio is en al vanaf 10 minuten per dag bijdraagt aan je gezondheid?'
where name = 'Rustig opwarmen';

update public.exercises set
  steps = '["Verhoog je tempo naar een stevige wandelpas.","Houd een tempo aan waarbij praten nog net lukt, maar zingen niet meer.","Houd je houding rechtop met ontspannen schouders.","Houd dit tempo vast voor de aangegeven tijd."]',
  why_it_helps = 'Stevig doorlopen traint je uithoudingsvermogen en hart- en vaatgezondheid.',
  common_mistakes = 'Zo hard lopen dat je buiten adem raakt — dat is voor deze oefening niet de bedoeling.',
  fun_fact = 'Wist je dat stevig wandelen al kan bijdragen aan een betere bloedsuikerregulatie na de maaltijd?'
where name = 'Stevig doorlopen';

update public.exercises set
  steps = '["Bouw je tempo geleidelijk af.","Laat je ademhaling tot rust komen.","Loop de laatste minuten in een ontspannen tempo.","Sluit af met een paar rustige ademhalingen."]',
  why_it_helps = 'Afkoelen helpt je hartslag geleidelijk te laten dalen in plaats van abrupt te stoppen.',
  common_mistakes = 'Abrupt stilstaan direct na een stevig tempo.',
  fun_fact = 'Wist je dat een rustige afkoeling je lichaam helpt om sneller te herstellen voor de rest van je dag?'
where name = 'Afkoelen';

-- =========================================================
-- Hardlopen - Interval
-- =========================================================
update public.exercises set
  steps = '["Start met rustig wandelen of licht joggen.","Bouw geleidelijk op naar een lichte drafpas.","Houd je schouders ontspannen en armen losjes.","Gebruik deze minuten om je lichaam op te warmen."]',
  why_it_helps = 'Inlopen bereidt je spieren en gewrichten voor op de intervallen die volgen, wat het risico op blessures verkleint.',
  common_mistakes = 'Direct vol tempo starten zonder opbouw.',
  fun_fact = 'Wist je dat warme spieren soepeler bewegen en minder kans hebben op blessures?'
where name = 'Inlopen';

update public.exercises set
  steps = '["Verhoog je tempo naar een pittig, maar vol te houden tempo.","Houd je ademhaling ritmisch.","Focus op een lichte, ontspannen voetlanding.","Houd dit tempo vol voor de aangegeven tijd."]',
  why_it_helps = 'Intervaltraining verbetert je conditie en uithoudingsvermogen effectiever dan een constant rustig tempo alleen.',
  common_mistakes = 'Een tempo kiezen dat niet vol te houden is voor de hele interval.',
  fun_fact = 'Wist je dat je conditie opbouwt door periodes van inspanning af te wisselen met herstel — precies wat intervaltraining doet?'
where name = 'Interval: stevig tempo';

update public.exercises set
  steps = '["Zak terug naar een rustig, herstellend tempo.","Laat je ademhaling tot rust komen.","Blijf in beweging in plaats van stil te staan.","Bereid je voor op de volgende interval."]',
  why_it_helps = 'Het hersteltempo geeft je lichaam de kans om te herstellen tussen de pittige intervallen door, zodat je de volgende met genoeg energie aankunt.',
  common_mistakes = 'Volledig stilstaan in plaats van rustig doorbewegen.',
  fun_fact = 'Wist je dat actief herstel (rustig doorbewegen) vaak effectiever is dan volledig stilstaan?'
where name = 'Interval: hersteltempo';

update public.exercises set
  steps = '["Bouw je tempo af naar een rustige drafpas.","Ga daarna over in wandelen.","Laat je ademhaling en hartslag rustig zakken.","Sluit af met een paar diepe ademhalingen."]',
  why_it_helps = 'Uitlopen helpt je hartslag geleidelijk laten dalen en ondersteunt herstel na de training.',
  common_mistakes = 'Direct na de laatste interval stilstaan zonder af te bouwen.',
  fun_fact = 'Wist je dat je lichaam na het sporten nog een tijdje doorwerkt aan herstel — een rustige afkoeling ondersteunt dat proces?'
where name = 'Uitlopen';

-- =========================================================
-- Mobiliteit - Rustige Reset
-- =========================================================
update public.exercises set
  steps = '["Ga staan met je handen losjes op je heupen.","Maak rustige, ruime cirkels met je heupen.","Draai een aantal keer in één richting.","Wissel daarna van richting."]',
  why_it_helps = 'Heupopeners houden je heupgewrichten soepel, wat bijdraagt aan comfortabeler lopen, zitten en bukken.',
  common_mistakes = 'Te kleine, gehaaste cirkels maken in plaats van rustig en ruim te bewegen.',
  fun_fact = 'Wist je dat je heupen een van de meest gebruikte gewrichten van je lichaam zijn, elke stap die je zet?'
where name = 'Heupopeners';

update public.exercises set
  steps = '["Ga rechtop staan of zitten met ontspannen armen.","Maak grote, langzame cirkels met beide schouders.","Draai een aantal keer naar achteren.","Wissel daarna naar voren."]',
  why_it_helps = 'Schoudercirkels ontspannen vaak gespannen schouders, bijvoorbeeld na lang zitten achter een scherm.',
  common_mistakes = 'Kleine, snelle bewegingen in plaats van grote, rustige cirkels.',
  fun_fact = 'Wist je dat veel spanning in nek en schouders komt door langdurig dezelfde houding aan te houden?'
where name = 'Schoudercirkels';

update public.exercises set
  steps = '["Til één voet licht van de grond.","Draai je enkel rustig rond.","Draai een aantal keer in één richting, wissel daarna.","Herhaal met de andere voet."]',
  why_it_helps = 'Soepele enkels dragen bij aan stabiliteit bij lopen en balans-oefeningen.',
  common_mistakes = 'De beweging alleen met je tenen maken in plaats van vanuit de hele enkel.',
  fun_fact = 'Wist je dat je enkels een belangrijke rol spelen bij je balans, juist ook als je ouder wordt?'
where name = 'Enkelmobiliteit';

-- =========================================================
-- Fietsen - Duurtraining
-- =========================================================
update public.exercises set
  steps = '["Fiets de eerste minuten in een licht, comfortabel tempo.","Laat je benen wennen aan de beweging.","Houd een ontspannen houding aan.","Bouw je tempo geleidelijk op."]',
  why_it_helps = 'Rustig opbouwen bereidt je spieren en gewrichten voor op de duurtraining die volgt.',
  common_mistakes = 'Direct op hoge weerstand of tempo starten.',
  fun_fact = 'Wist je dat fietsen een gewrichtsvriendelijke vorm van cardio is omdat je gewicht wordt gedragen door het zadel?'
where name = 'Rustig opbouwen';

update public.exercises set
  steps = '["Kies een weerstand of tempo dat je voor langere tijd kunt volhouden.","Houd een gelijkmatige trapfrequentie aan.","Houd je bovenlichaam ontspannen.","Blijf dit tempo aanhouden voor de aangegeven duur."]',
  why_it_helps = 'Duurtraining bouwt je algemene conditie en uithoudingsvermogen op.',
  common_mistakes = 'Te zwaar fietsen waardoor je het tempo niet volhoudt voor de hele duur.',
  fun_fact = 'Wist je dat duurtraining op een gelijkmatig tempo je lichaam leert vet efficiënter als energiebron te gebruiken?'
where name = 'Duurtempo';

update public.exercises set
  steps = '["Verlaag geleidelijk je tempo of weerstand.","Fiets de laatste minuten rustig uit.","Laat je ademhaling tot rust komen.","Stap rustig af."]',
  why_it_helps = 'Afbouwen helpt je hartslag geleidelijk te verlagen in plaats van abrupt te stoppen.',
  common_mistakes = 'Abrupt stoppen met fietsen direct na een pittig tempo.',
  fun_fact = 'Wist je dat een rustige afkoeling bijdraagt aan een prettiger herstel na je training?'
where name = 'Afbouwen';

-- =========================================================
-- NEW: short (5-10 min) workouts for busy days
-- =========================================================
do $$
declare
  w_core_kort uuid;
  w_ademhaling uuid;
  w_nek_schouders uuid;
begin
  if exists (select 1 from public.workouts where title = 'Core Boost - 7 minuten') then
    return;
  end if;

  insert into public.workouts (id, title, type, duration, difficulty, description)
  values (gen_random_uuid(), 'Core Boost - 7 minuten', 'krachttraining', 7, 'gemiddeld',
    'Een korte, pittige core-sessie voor dagen waarop je weinig tijd hebt maar toch iets wilt doen.')
  returning id into w_core_kort;

  insert into public.workouts (id, title, type, duration, difficulty, description)
  values (gen_random_uuid(), 'Ademhaling & Ontspanning', 'mobiliteit', 5, 'makkelijk',
    'Vijf minuten bewuste ademhaling en zachte beweging om tot rust te komen.')
  returning id into w_ademhaling;

  insert into public.workouts (id, title, type, duration, difficulty, description)
  values (gen_random_uuid(), 'Nek & Schouders Reset', 'mobiliteit', 8, 'makkelijk',
    'Korte mobiliteitsroutine gericht op nek en schouders, ideaal na een dag achter een scherm.')
  returning id into w_nek_schouders;

  insert into public.exercises (workout_id, name, muscle_group, instructions, steps, sets, reps, order_index, why_it_helps, common_mistakes, fun_fact) values
    (w_core_kort, 'Plank', 'core', 'Houd een rechte lijn van hoofd tot hielen.',
      '["Steun op je onderarmen en tenen, ellebogen onder je schouders.","Span je buikspieren aan en houd een rechte lijn van hoofd tot hielen.","Adem rustig door terwijl je de houding vasthoudt."]',
      3, '20-30 sec', 1,
      'De plank traint je hele core in één beweging — efficiënt als je weinig tijd hebt.',
      'Je heupen laten zakken tijdens het volhouden.',
      'Wist je dat een sterke core bijdraagt aan een betere houding, ook als je de rest van de dag zit?'),
    (w_core_kort, 'Glute bridge', 'billen/hamstrings', 'Druk door je hielen en til je heupen op.',
      '["Lig op je rug, knieën gebogen, voeten plat op de grond.","Druk door je hielen en til je heupen op tot een rechte lijn.","Knijp je bilspieren samen bovenaan.","Laat gecontroleerd zakken."]',
      3, '12-15', 2,
      'Activeert je bilspieren, die je bekken en onderrug ondersteunen.',
      'Vooral je onderrug gebruiken in plaats van je bilspieren.',
      'Wist je dat sterke bilspieren bijdragen aan een stabielere loop en minder lagerugklachten?'),
    (w_core_kort, 'Side plank per kant', 'core', 'Til je heupen op tot een rechte lijn.',
      '["Lig op je zij, steun op je onderarm.","Til je heupen op tot een rechte lijn van hoofd tot voeten.","Houd vast en adem rustig door.","Wissel van kant."]',
      2, '15-20 sec per kant', 3,
      'Traint de zijkant van je core, belangrijk voor zijwaartse stabiliteit.',
      'Je heupen laten draaien in plaats van gestapeld houden.',
      'Wist je dat je schuine buikspieren je helpen bij bijna elke draaibeweging?');

  insert into public.exercises (workout_id, name, muscle_group, instructions, steps, sets, reps, order_index, why_it_helps, common_mistakes, fun_fact) values
    (w_ademhaling, 'Buikademhaling', 'ademhaling', 'Adem rustig in door je neus, laat je buik meebewegen.',
      '["Ga comfortabel zitten of liggen.","Leg één hand op je buik.","Adem rustig in door je neus, laat je buik meebewegen tegen je hand.","Adem langzaam uit door je mond."]',
      1, '10 ademhalingen', 1,
      'Bewuste ademhaling kan helpen je zenuwstelsel te kalmeren en spanning te verminderen.',
      'Hoog en snel ademen vanuit je borst in plaats van rustig vanuit je buik.',
      'Wist je dat langzame, diepe ademhaling je hartslag kan verlagen?'),
    (w_ademhaling, 'Kindhouding', 'rug/heupen', 'Zak met je billen naar je hielen en strek je armen naar voren.',
      '["Kniel en zak met je billen richting je hielen.","Laat je bovenlichaam voorover zakken.","Strek je armen naar voren.","Adem rustig door."]',
      1, '1-2 minuten', 2,
      'Een rustpositie die zacht rekt en helpt om tot rust te komen.',
      'De houding forceren als knieën of heupen dit niet toelaten.',
      'Wist je dat deze houding vaak als hersteldmoment tussen andere oefeningen wordt gebruikt?');

  insert into public.exercises (workout_id, name, muscle_group, instructions, steps, sets, reps, order_index, why_it_helps, common_mistakes, fun_fact) values
    (w_nek_schouders, 'Nekrek zijwaarts', 'nek', 'Laat je oor rustig richting je schouder zakken.',
      '["Ga rechtop zitten of staan.","Laat je oor rustig richting je schouder zakken.","Houd een paar seconden vast, voel de rek in je nek.","Kom terug naar het midden en wissel van kant."]',
      2, '15-20 sec per kant', 1,
      'Ontspant spanning die vaak opbouwt in de nek door lang zitten of schermgebruik.',
      'De rek forceren met je hand in plaats van de zwaartekracht het werk te laten doen.',
      'Wist je dat nekspanning vaak samenhangt met langdurig dezelfde houding aanhouden?'),
    (w_nek_schouders, 'Schoudercirkels', 'schouders', 'Maak grote, langzame cirkels met je schouders.',
      '["Ga rechtop staan of zitten.","Maak grote, langzame cirkels met beide schouders naar achteren.","Herhaal een aantal keer.","Wissel naar voren."]',
      1, '10 per richting', 2,
      'Ontspant gespannen schouders en houdt het gewricht soepel.',
      'Kleine, snelle bewegingen in plaats van grote, rustige cirkels.',
      'Wist je dat schoudercirkels ook helpen om je bovenrug rechter te laten voelen?'),
    (w_nek_schouders, 'Borstopener', 'borst/schouders', 'Vouw je handen achter je rug en trek je schouders naar achteren.',
      '["Sta rechtop, vouw je handen achter je rug (of pak een handdoek vast).","Trek je schouders naar achteren en beneden.","Til je handen licht omhoog tot je een rek in je borst voelt.","Houd vast en adem rustig door."]',
      2, '20-30 sec', 3,
      'Compenseert de naar-voren-gebogen houding die veel voorkomt bij zittend werk.',
      'Je onderrug hol trekken om meer rek te forceren.',
      'Wist je dat een geopende borsthouding kan bijdragen aan een prettiger, rechtere houding?');
end $$;
