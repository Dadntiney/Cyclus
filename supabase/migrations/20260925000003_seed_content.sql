-- Seed content library: workouts, exercises, recipes
-- Idempotent: only seeds when tables are empty.

do $$
declare
  w_kracht_full uuid;
  w_pilates_core uuid;
  w_yoga_flow uuid;
  w_wandel_herstel uuid;
  w_hardloop_interval uuid;
  w_mobiliteit uuid;
  w_fietsen_duur uuid;
begin
  if (select count(*) from public.workouts) > 0 then
    return;
  end if;

  insert into public.workouts (id, title, type, duration, difficulty, description)
  values (gen_random_uuid(), 'Krachttraining - Full Body', 'krachttraining', 35, 'gemiddeld',
    'Een complete full-body krachtsessie die alle grote spiergroepen aanspreekt. Ideaal om kracht op te bouwen in je eigen tempo.')
  returning id into w_kracht_full;

  insert into public.workouts (id, title, type, duration, difficulty, description)
  values (gen_random_uuid(), 'Pilates - Core & Stabiliteit', 'pilates', 25, 'makkelijk',
    'Rustige, gecontroleerde pilates-oefeningen gericht op een sterke core en betere houding.')
  returning id into w_pilates_core;

  insert into public.workouts (id, title, type, duration, difficulty, description)
  values (gen_random_uuid(), 'Yoga Flow - Zachte Beweging', 'yoga', 20, 'makkelijk',
    'Een vloeiende yogasessie die spanning loslaat en je lichaam zacht in beweging brengt.')
  returning id into w_yoga_flow;

  insert into public.workouts (id, title, type, duration, difficulty, description)
  values (gen_random_uuid(), 'Wandelen - Actief Herstel', 'wandelen', 30, 'makkelijk',
    'Een stevige wandeling in een tempo dat bij jou past. Goed voor energie en hoofd leegmaken.')
  returning id into w_wandel_herstel;

  insert into public.workouts (id, title, type, duration, difficulty, description)
  values (gen_random_uuid(), 'Hardlopen - Interval', 'hardlopen', 30, 'pittig',
    'Afwisselend rustig en stevig tempo om je conditie op te bouwen.')
  returning id into w_hardloop_interval;

  insert into public.workouts (id, title, type, duration, difficulty, description)
  values (gen_random_uuid(), 'Mobiliteit - Rustige Reset', 'mobiliteit', 10, 'makkelijk',
    'Korte mobiliteitsroutine voor soepele gewrichten, ideaal als hersteldag.')
  returning id into w_mobiliteit;

  insert into public.workouts (id, title, type, duration, difficulty, description)
  values (gen_random_uuid(), 'Fietsen - Duurtraining', 'fietsen', 40, 'gemiddeld',
    'Een rustige duurrit om je conditie te onderhouden zonder je lijf te overvragen.')
  returning id into w_fietsen_duur;

  -- Exercises: Krachttraining full body
  insert into public.exercises (workout_id, name, muscle_group, instructions, sets, reps, order_index) values
    (w_kracht_full, 'Squats', 'benen', 'Sta met voeten heupbreedte uit elkaar en zak door je knieën alsof je gaat zitten.', 3, '10-12', 1),
    (w_kracht_full, 'Push-ups', 'borst/armen', 'Begin op knieën of tenen, laat je borst richting de grond zakken en duw terug omhoog.', 3, '8-12', 2),
    (w_kracht_full, 'Rows met weerstandsband of gewicht', 'rug', 'Trek de band of het gewicht naar je middel, knijp je schouderbladen samen.', 3, '10-12', 3),
    (w_kracht_full, 'Glute bridge', 'billen/hamstrings', 'Lig op je rug, druk door je hielen en til je heupen op.', 3, '12-15', 4),
    (w_kracht_full, 'Plank', 'core', 'Houd een rechte lijn van hoofd tot hielen, span je buikspieren aan.', 3, '30-45 sec', 5);

  -- Exercises: Pilates core
  insert into public.exercises (workout_id, name, muscle_group, instructions, sets, reps, order_index) values
    (w_pilates_core, 'The Hundred', 'core', 'Lig op je rug, til hoofd en benen op, pomp je armen op en neer.', 1, '100 tellen', 1),
    (w_pilates_core, 'Roll-up', 'core', 'Rol langzaam omhoog vanuit liggende positie naar zit.', 3, '6-8', 2),
    (w_pilates_core, 'Side plank', 'core/schouders', 'Steun op onderarm, til je heupen op tot een rechte lijn.', 2, '20-30 sec per kant', 3),
    (w_pilates_core, 'Leg circles', 'core/heupen', 'Maak grote cirkels met een been terwijl je rug stabiel blijft.', 2, '8 per richting', 4);

  -- Exercises: Yoga flow
  insert into public.exercises (workout_id, name, muscle_group, instructions, sets, reps, order_index) values
    (w_yoga_flow, 'Kat-koe', 'wervelkolom', 'Wissel af tussen een bolle en holle rug op je ademhaling.', 1, '8-10 ademhalingen', 1),
    (w_yoga_flow, 'Neerwaartse hond', 'volledig lichaam', 'Duw je heupen omhoog en achteren, laat je hielen richting de mat zakken.', 3, '5 ademhalingen', 2),
    (w_yoga_flow, 'Kindhouding', 'rug/heupen', 'Zak met je billen naar je hielen en strek je armen naar voren.', 1, '1-2 minuten', 3),
    (w_yoga_flow, 'Torsie liggend', 'wervelkolom', 'Lig op je rug en laat je knieën zacht naar één kant zakken.', 2, '30 sec per kant', 4);

  -- Exercises: Wandelen
  insert into public.exercises (workout_id, name, muscle_group, instructions, sets, reps, order_index) values
    (w_wandel_herstel, 'Rustig opwarmen', 'benen', 'Begin de eerste 5 minuten in een ontspannen tempo.', 1, '5 min', 1),
    (w_wandel_herstel, 'Stevig doorlopen', 'benen/cardio', 'Verhoog je tempo naar een wandeling waarbij praten nog net lukt.', 1, '20 min', 2),
    (w_wandel_herstel, 'Afkoelen', 'benen', 'Bouw je tempo weer rustig af.', 1, '5 min', 3);

  -- Exercises: Hardlopen interval
  insert into public.exercises (workout_id, name, muscle_group, instructions, sets, reps, order_index) values
    (w_hardloop_interval, 'Inlopen', 'cardio', 'Rustig inlopen om spieren op te warmen.', 1, '5 min', 1),
    (w_hardloop_interval, 'Interval: stevig tempo', 'cardio/benen', 'Loop 2 minuten in een pittig tempo.', 5, '2 min', 2),
    (w_hardloop_interval, 'Interval: hersteltempo', 'cardio/benen', 'Loop 1 minuut rustig om te herstellen.', 5, '1 min', 3),
    (w_hardloop_interval, 'Uitlopen', 'cardio', 'Bouw rustig af naar loopsnelheid.', 1, '5 min', 4);

  -- Exercises: Mobiliteit
  insert into public.exercises (workout_id, name, muscle_group, instructions, sets, reps, order_index) values
    (w_mobiliteit, 'Heupopeners', 'heupen', 'Maak rustige cirkels met je heupen in beide richtingen.', 1, '10 per richting', 1),
    (w_mobiliteit, 'Schoudercirkels', 'schouders', 'Maak grote, langzame cirkels met je schouders.', 1, '10 per richting', 2),
    (w_mobiliteit, 'Enkelmobiliteit', 'enkels', 'Draai je enkels rustig rond in beide richtingen.', 1, '10 per richting', 3);

  -- Exercises: Fietsen
  insert into public.exercises (workout_id, name, muscle_group, instructions, sets, reps, order_index) values
    (w_fietsen_duur, 'Rustig opbouwen', 'benen/cardio', 'Fiets de eerste 10 minuten rustig in.', 1, '10 min', 1),
    (w_fietsen_duur, 'Duurtempo', 'benen/cardio', 'Houd een gelijkmatig, comfortabel tempo aan.', 1, '25 min', 2),
    (w_fietsen_duur, 'Afbouwen', 'benen', 'Fiets de laatste 5 minuten rustig uit.', 1, '5 min', 3);
end $$;

-- Recipes
do $$
begin
  if (select count(*) from public.recipes) > 0 then
    return;
  end if;

  insert into public.recipes (title, description, ingredients, instructions, preparation_time, nutrition_information, category) values
  (
    'Zalm met zoete aardappel en groenten',
    'Een voedzame, eiwitrijke maaltijd vol omega-3 vetzuren.',
    '["200g zalmfilet", "1 zoete aardappel", "handvol broccoli", "1 el olijfolie", "peper en zout", "citroen"]',
    'Verwarm de oven voor op 200°C. Snijd de zoete aardappel in blokjes en rooster 20 minuten. Voeg de zalm en broccoli toe en gaar nog 12-15 minuten. Besprenkel met citroen.',
    35,
    '{"calorieen": 520, "eiwit": "38g", "koolhydraten": "42g", "vet": "22g"}',
    array['Diner', 'Eiwitrijk']
  ),
  (
    'Overnight oats met bessen',
    'Snel klaar te zetten, ideaal voor drukke ochtenden.',
    '["50g havermout", "150ml plantaardige melk", "1 el chiazaad", "handvol bessen", "1 tl honing"]',
    'Meng havermout, melk en chiazaad in een pot. Laat een nacht in de koelkast staan. Top af met bessen en honing.',
    5,
    '{"calorieen": 320, "eiwit": "10g", "koolhydraten": "48g", "vet": "9g"}',
    array['Ontbijt', 'Snel', 'Vegetarisch', 'Meal prep']
  ),
  (
    'Linzensalade met feta',
    'Een lichte, eiwitrijke lunch vol vezels.',
    '["150g gekookte linzen", "50g feta", "handvol rucola", "10 cherrytomaatjes", "olijfolie", "balsamicoazijn"]',
    'Meng de linzen met rucola en cherrytomaatjes. Verkruimel de feta erover en besprenkel met olijfolie en azijn.',
    15,
    '{"calorieen": 380, "eiwit": "20g", "koolhydraten": "35g", "vet": "16g"}',
    array['Lunch', 'Vegetarisch', 'Eiwitrijk']
  ),
  (
    'Kikkererwtencurry',
    'Warme, kruidige veganistische curry vol vezels.',
    '["1 blik kikkererwten", "1 blik kokosmelk", "1 ui", "2 teentjes knoflook", "1 el kerriepasta", "spinazie"]',
    'Fruit ui en knoflook aan. Voeg kerriepasta toe en bak kort mee. Voeg kikkererwten en kokosmelk toe, laat 15 minuten sudderen. Roer de spinazie erdoor.',
    30,
    '{"calorieen": 410, "eiwit": "14g", "koolhydraten": "38g", "vet": "22g"}',
    array['Diner', 'Veganistisch', 'Meal prep']
  ),
  (
    'Griekse yoghurt met noten en honing',
    'Snel, eiwitrijk tussendoortje.',
    '["200g Griekse yoghurt", "handvol walnoten", "1 tl honing", "kaneel"]',
    'Schep de yoghurt in een kom, top af met noten, honing en een snufje kaneel.',
    5,
    '{"calorieen": 280, "eiwit": "18g", "koolhydraten": "16g", "vet": "16g"}',
    array['Snack', 'Snel', 'Vegetarisch', 'Eiwitrijk']
  ),
  (
    'Gegrilde kip met quinoa en groenten',
    'Compleet gebalanceerde maaltijd voor na een training.',
    '["150g kipfilet", "80g quinoa", "gemengde groenten", "olijfolie", "kruiden naar smaak"]',
    'Kook de quinoa volgens de verpakking. Grill de kip en bak de groenten kort. Meng alles samen.',
    25,
    '{"calorieen": 480, "eiwit": "42g", "koolhydraten": "40g", "vet": "14g"}',
    array['Diner', 'Eiwitrijk', 'Meal prep']
  ),
  (
    'Veganistische smoothiebowl',
    'Fris en fruitig ontbijt vol vitamines.',
    '["1 bevroren banaan", "handvol bevroren bessen", "100ml plantaardige melk", "granola", "kokosrasp"]',
    'Blend banaan, bessen en melk tot een dikke smoothie. Giet in een kom en top af met granola en kokosrasp.',
    10,
    '{"calorieen": 340, "eiwit": "8g", "koolhydraten": "58g", "vet": "9g"}',
    array['Ontbijt', 'Veganistisch', 'Snel']
  ),
  (
    'Pittige pompoensoep',
    'Warme, troostrijke soep vol groenten.',
    '["500g pompoen", "1 ui", "500ml groentebouillon", "scheutje kokosmelk", "chilivlokken"]',
    'Fruit de ui aan, voeg pompoen en bouillon toe. Laat 20 minuten sudderen en blend glad. Werk af met kokosmelk en chili.',
    35,
    '{"calorieen": 210, "eiwit": "4g", "koolhydraten": "26g", "vet": "9g"}',
    array['Lunch', 'Diner', 'Vegetarisch', 'Veganistisch']
  );
end $$;
