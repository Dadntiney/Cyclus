-- Recipe database expansion
-- Continues Claude's 2026-09-28 live batch (70 recipes) and adds a gap-fill batch.
-- Idempotent via WHERE NOT EXISTS on title. Images warmed separately.

update public.recipes
set description = replace(description, 'currry', 'curry')
where description like '%currry%';


-- Claude batch (reproducible for fresh environments)

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Amerikaanse pompoen-quinoa ovenschotel',
  'Een verzadigende ovenschotel van pompoen, quinoa, zwarte bonen en kaas — stevig comfort food vol magnesium.',
  '["500g pompoen", "150g quinoa", "1 blik zwarte bonen", "1 tl paprikapoeder", "geraspte kaas", "groentebouillon"]'::jsonb,
  'Rooster de pompoen, kook de quinoa, meng alles met bonen in een ovenschaal en bak af met kaas.',
  45,
  '{"vet": "14g", "eiwit": "17g", "calorieen": 400, "koolhydraten": "48g"}'::jsonb,
  '{"Diner","Ovengerecht","Vegetarisch","Glutenvrij","Magnesiumrijk","Vezelrijk","Voorbereiden"}'::text[],
  NULL,
  4,
  'makkelijk',
  '["Verwarm de oven voor op 200°C en rooster de in blokjes gesneden pompoen 20 minuten.", "Kook de quinoa volgens de verpakking in groentebouillon.", "Meng de quinoa met de geroosterde pompoen, zwarte bonen en paprikapoeder in een ovenschaal.", "Bestrooi met geraspte kaas.", "Bak nog 10-15 minuten tot de kaas gesmolten en goudbruin is."]'::jsonb,
  '["Avocado", "Verse koriander"]'::jsonb,
  'Gebruik iets minder quinoa en vul aan met extra pompoen en bonen.',
  'Tot 4 dagen in de koelkast en goed in te vriezen.',
  'Maak een dubbele portie in een grote ovenschaal en verdeel over bakjes voor de week.',
  true
where not exists (select 1 from public.recipes where title = 'Amerikaanse pompoen-quinoa ovenschotel');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Bananen-nicecream met pure chocolade',
  'Romig "ijs" van bevroren banaan, gemixt tot een gladde massa en afgewerkt met pure chocolade.',
  '["3 bevroren bananen", "scheutje plantaardige melk", "handvol pure chocoladestukjes"]'::jsonb,
  'Blend de bevroren banaan met een scheutje melk tot een romige massa en werk af met chocoladestukjes.',
  10,
  '{"vet": "6g", "eiwit": "3g", "calorieen": 210, "koolhydraten": "38g"}'::jsonb,
  '{"Dessert","Veganistisch","Glutenvrij","Lactosevrij","Snel"}'::text[],
  NULL,
  2,
  'makkelijk',
  '["Snijd de bevroren bananen in stukken.", "Blend de banaan met een klein scheutje plantaardige melk tot een romige, ijsachtige massa.", "Schep direct in een kom.", "Werk af met pure chocoladestukjes."]'::jsonb,
  '["Pindakaas", "Kaneel"]'::jsonb,
  'Gebruik minder banaan en meer bevroren bessen voor minder koolhydraten.',
  'Het lekkerst direct na bereiding — nicecream smelt snel.',
  'Vries bananen in stukken in zodat je altijd binnen 5 minuten nicecream kunt maken.',
  true
where not exists (select 1 from public.recipes where title = 'Bananen-nicecream met pure chocolade');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Bibim guksu (Koreaanse pittige koude noedels)',
  'Koude tarwenoedels in een pittig-zoete gochujangsaus met kleurrijke groenten en komkommer.',
  '["200g tarwenoedels (somyeon)", "1/2 komkommer", "1 wortel", "2 el gochujang", "1 el rijstazijn", "1 tl suiker", "sesamolie"]'::jsonb,
  'Kook de noedels en spoel koud af, meng gochujang met azijn en suiker en meng alles met de gesneden groenten.',
  20,
  '{"vet": "8g", "eiwit": "10g", "calorieen": 380, "koolhydraten": "68g"}'::jsonb,
  '{"Lunch","Diner","Vegetarisch","Snel"}'::text[],
  NULL,
  2,
  'makkelijk',
  '["Kook de noedels volgens de verpakking en spoel direct koud af onder de kraan.", "Snijd de komkommer en wortel in dunne reepjes.", "Meng de gochujang met rijstazijn, suiker en een scheutje sesamolie tot een dressing.", "Meng de koude noedels met de dressing en groenten.", "Serveer direct, eventueel met een half gekookt ei erbij."]'::jsonb,
  '["Half ei per persoon", "Peer in reepjes"]'::jsonb,
  'Gebruik minder noedels en vul aan met extra komkommer en wortel voor minder koolhydraten.',
  'Bewaar noedels en saus apart, tot 1 dag in de koelkast.',
  'Kook de noedels vooraf en spoel goed koud af zodat ze niet aan elkaar plakken.',
  true
where not exists (select 1 from public.recipes where title = 'Bibim guksu (Koreaanse pittige koude noedels)');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Bibimbap met kimchi',
  'Een kleurrijke Koreaanse rijstbowl met verschillende groenten, een spiegelei en pittige, gefermenteerde kimchi.',
  '["200g rijst", "handvol spinazie", "1 wortel", "handvol taugé", "100g kimchi", "1 ei per persoon", "sesamolie", "gochujang"]'::jsonb,
  'Kook de rijst, blancheer en kruid elke groente apart, bak de eieren en schik alles op de rijst met kimchi en gochujang.',
  30,
  '{"vet": "16g", "eiwit": "18g", "calorieen": 460, "koolhydraten": "58g"}'::jsonb,
  '{"Diner","Lunch","Bowl","Vegetarisch","Glutenvrij","Vezelrijk"}'::text[],
  NULL,
  2,
  'gemiddeld',
  '["Kook de rijst volgens de verpakking.", "Blancheer de spinazie en taugé apart kort en kruid met een beetje sesamolie en zout.", "Rasp of julienne de wortel en bak kort in een scheutje olie.", "Bak voor elke portie een spiegelei.", "Verdeel de rijst over kommen en schik de groenten, kimchi en het ei erop.", "Serveer met gochujang en een scheutje sesamolie."]'::jsonb,
  '["Rundvlees in reepjes", "Extra sesamzaad"]'::jsonb,
  'Vervang de helft van de rijst door extra groenten voor minder koolhydraten.',
  'Bewaar de onderdelen apart, tot 2 dagen in de koelkast.',
  'Bereid de groenten en rijst vooraf en stel de bowl pas samen vlak voor het eten.',
  false
where not exists (select 1 from public.recipes where title = 'Bibimbap met kimchi');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Braziliaanse açaí bowl',
  'Een kleurrijke, verfrissende bowl van bevroren açaípulp, banaan en topping van vers fruit en granola.',
  '["100g bevroren açaípulp", "1 bevroren banaan", "scheutje plantaardige melk", "granola", "handvol bosbessen", "schijfjes banaan"]'::jsonb,
  'Blend de açaí met banaan en melk tot een dikke smoothie en top af met fruit en granola.',
  10,
  '{"vet": "10g", "eiwit": "6g", "calorieen": 340, "koolhydraten": "58g"}'::jsonb,
  '{"Ontbijt","Bowl","Smoothie","Veganistisch","Antioxidantrijk"}'::text[],
  NULL,
  1,
  'makkelijk',
  '["Blend de bevroren açaípulp, banaan en plantaardige melk tot een dikke, romige massa.", "Giet in een kom.", "Top af met granola, bosbessen en schijfjes banaan.", "Werk eventueel af met kokosrasp."]'::jsonb,
  '["Kokosrasp", "Chiazaad"]'::jsonb,
  'Gebruik minder banaan en meer bevroren bessen voor minder koolhydraten.',
  'Het lekkerst direct na bereiding — een açaí bowl wordt snel waterig.',
  'Vries bananen vooraf in stukken in, zodat je alleen nog hoeft te blenden.',
  false
where not exists (select 1 from public.recipes where title = 'Braziliaanse açaí bowl');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Caprese salade met burrata',
  'De Italiaanse klassieker in een romige versie: rijpe tomaat, romige burrata en verse basilicum.',
  '["4 rijpe tomaten", "125g burrata", "verse basilicum", "olijfolie", "balsamicoazijn"]'::jsonb,
  'Snijd de tomaten in plakken, schik met de burrata en basilicum en besprenkel met olijfolie en balsamico.',
  10,
  '{"vet": "26g", "eiwit": "16g", "calorieen": 320, "koolhydraten": "8g"}'::jsonb,
  '{"Lunch","Salade","Vegetarisch","Glutenvrij","Snel","Antioxidantrijk"}'::text[],
  NULL,
  2,
  'makkelijk',
  '["Snijd de tomaten in plakken en schik op een bord.", "Scheur de burrata open en leg erbovenop.", "Verdeel verse basilicumblaadjes eroverheen.", "Besprenkel met olijfolie en een scheutje balsamicoazijn en breng op smaak met zout en peper."]'::jsonb,
  '["Geroosterd stokbrood", "Pijnboompitten"]'::jsonb,
  'Dit gerecht is van nature al koolhydraatarm.',
  'Het lekkerst vers bereid en op kamertemperatuur gegeten.',
  'Snijd de tomaten vooraf, voeg de burrata pas vlak voor het serveren toe.',
  false
where not exists (select 1 from public.recipes where title = 'Caprese salade met burrata');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Caribische kip-kokosrijst met bonen (rice and peas)',
  'Romige kokosrijst met bonen en kruidige kip — een Caribische klassieker vol comfort.',
  '["4 kipdijfilets", "1 blik kokosmelk", "200g rijst", "1 blik kidneybonen", "verse tijm", "1 chilipeper", "1 teentje knoflook"]'::jsonb,
  'Kruid en bak de kip, kook de rijst in kokosmelk met bonen en kruiden en serveer samen.',
  40,
  '{"vet": "22g", "eiwit": "32g", "calorieen": 520, "koolhydraten": "48g"}'::jsonb,
  '{"Diner","Rijst","Glutenvrij","Lactosevrij","Eiwitrijk","Magnesiumrijk","Voorbereiden"}'::text[],
  NULL,
  4,
  'gemiddeld',
  '["Kruid de kipdijfilets met tijm, knoflook en peper en bak of gril gaar.", "Breng de kokosmelk met evenveel water, de kidneybonen, tijm en een hele chilipeper aan de kook.", "Voeg de rijst toe en laat 15-18 minuten zachtjes garen tot de rijst gaar is.", "Verwijder de hele chilipeper.", "Serveer de kokosrijst met de kip erbij."]'::jsonb,
  '["Lente-ui", "Limoen erbij"]'::jsonb,
  'Gebruik magere kokosmelk (light) en iets minder rijst voor minder koolhydraten en vet.',
  'Tot 3 dagen in de koelkast en goed in te vriezen.',
  'Maak een dubbele portie rijst en kip en verdeel over bakjes voor de week.',
  false
where not exists (select 1 from public.recipes where title = 'Caribische kip-kokosrijst met bonen (rice and peas)');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Chocoladepudding van avocado en cacao',
  'Een romige, voedzame chocoladepudding gemaakt van rijpe avocado en pure cacao — verrassend luchtig en niet te zoet.',
  '["2 rijpe avocados", "4 el pure cacaopoeder", "3 el ahornsiroop", "scheutje plantaardige melk", "snufje zeezout"]'::jsonb,
  'Blend avocado met cacao, ahornsiroop en een scheutje melk tot een gladde, romige pudding.',
  15,
  '{"vet": "16g", "eiwit": "4g", "calorieen": 220, "koolhydraten": "18g"}'::jsonb,
  '{"Dessert","Snack","Veganistisch","Glutenvrij","Lactosevrij","Magnesiumrijk","Snel"}'::text[],
  NULL,
  3,
  'makkelijk',
  '["Halveer de avocados en schep het vruchtvlees in een blender.", "Voeg de cacaopoeder, ahornsiroop, melk en zout toe.", "Blend tot een gladde, romige pudding.", "Verdeel over kommetjes en laat 30 minuten opstijven in de koelkast."]'::jsonb,
  '["Frambozen erbij", "Kokosrasp"]'::jsonb,
  'Gebruik iets minder ahornsiroop voor een minder zoete, koolhydraatarmere versie.',
  'Tot 2 dagen in de koelkast, afgedekt zodat de bovenkant niet verkleurt.',
  'Maak een grote portie vooraf — deze pudding is een fijn toetje voor meerdere dagen.',
  false
where not exists (select 1 from public.recipes where title = 'Chocoladepudding van avocado en cacao');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Dal makhani (romige zwarte linzencurry)',
  'Een rijke, romige Indiase curry van zwarte linzen en kidneybonen, langzaam gegaard met tomaat en boter.',
  '["200g zwarte linzen (urad dal)", "handvol kidneybonen", "1 blik tomatenblokjes", "1 ui", "2 teentjes knoflook", "verse gember", "scheutje room"]'::jsonb,
  'Kook de linzen en bonen gaar, fruit ui, knoflook en gember, voeg tomaat en de peulvruchten toe en laat lang sudderen met een scheutje room.',
  60,
  '{"vet": "14g", "eiwit": "18g", "calorieen": 360, "koolhydraten": "38g"}'::jsonb,
  '{"Diner","Curry","Vegetarisch","Glutenvrij","Magnesiumrijk","Vezelrijk","Voorbereiden"}'::text[],
  NULL,
  4,
  'gemiddeld',
  '["Week de zwarte linzen bij voorkeur een nacht en kook ze samen met de kidneybonen gaar.", "Fruit de ui, knoflook en gember aan in een scheutje boter.", "Voeg de tomatenblokjes toe en laat 10 minuten inkoken.", "Voeg de gekookte linzen en bonen toe met wat kookvocht en laat 30 minuten zachtjes sudderen.", "Roer een scheutje room erdoor en breng op smaak met garam masala en zout."]'::jsonb,
  '["Garam masala", "Rijst of naanbrood erbij"]'::jsonb,
  'Gebruik iets minder linzen en bonen en vul aan met extra spinazie.',
  'Tot 4 dagen in de koelkast en uitstekend in te vriezen.',
  'Kook een grote pan linzen en bonen vooraf en vries in porties in.',
  true
where not exists (select 1 from public.recipes where title = 'Dal makhani (romige zwarte linzencurry)');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Donkere chocolade-energyballs met dadels',
  'Snelle, magnesiumrijke energyballs van dadels, amandelen en pure cacao — een voedzaam alternatief voor een chocoladereep.',
  '["200g ontpitte dadels", "100g amandelen", "3 el pure cacaopoeder", "1 el kokosolie", "snufje zeezout"]'::jsonb,
  'Blend alle ingrediënten tot een plakkerig mengsel en rol er balletjes van.',
  15,
  '{"vet": "10g", "eiwit": "5g", "calorieen": 190, "koolhydraten": "22g"}'::jsonb,
  '{"Snack","Dessert","Veganistisch","Glutenvrij","Lactosevrij","Magnesiumrijk","Snel","Voorbereiden"}'::text[],
  NULL,
  4,
  'makkelijk',
  '["Doe de dadels, amandelen, cacaopoeder, kokosolie en zout in een foodprocessor.", "Blend tot een plakkerig, samenhangend mengsel.", "Rol er met natte handen balletjes van.", "Rol de balletjes eventueel door kokosrasp.", "Laat 30 minuten opstijven in de koelkast."]'::jsonb,
  '["Kokosrasp om in te rollen", "Chiazaad"]'::jsonb,
  'Gebruik iets minder dadels en meer amandelen voor minder koolhydraten.',
  'Tot een week in een afgesloten bakje in de koelkast.',
  'Maak een grote batch — energyballs vriezen ook uitstekend in.',
  true
where not exists (select 1 from public.recipes where title = 'Donkere chocolade-energyballs met dadels');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Fesenjan (Perzische kip in granaatappel-walnootsaus)',
  'Een rijke Perzische stoof van kip in een diepe saus van gemalen walnoten en granaatappelmelasse.',
  '["4 kipdijfilets", "200g walnoten, gemalen", "4 el granaatappelmelasse", "1 ui", "kippenbouillon", "handvol granaatappelpitten"]'::jsonb,
  'Fruit de ui, bak de kip aan, voeg gemalen walnoten, granaatappelmelasse en bouillon toe en laat 40 minuten sudderen.',
  55,
  '{"vet": "32g", "eiwit": "32g", "calorieen": 480, "koolhydraten": "16g"}'::jsonb,
  '{"Diner","Glutenvrij","Lactosevrij","Eiwitrijk","Antioxidantrijk"}'::text[],
  NULL,
  4,
  'gemiddeld',
  '["Fruit de ui aan in een scheutje olie.", "Bak de kipdijfilets kort aan tot lichtbruin.", "Voeg de gemalen walnoten, granaatappelmelasse en bouillon toe.", "Laat afgedekt 35-40 minuten zachtjes sudderen tot de saus indikt.", "Breng op smaak met zout en eventueel wat extra melasse voor de zoetzure balans.", "Werk af met verse granaatappelpitten."]'::jsonb,
  '["Kaneel", "Rijst erbij"]'::jsonb,
  'Dit gerecht is al relatief koolhydraatarm — serveer met bloemkoolrijst in plaats van gewone rijst.',
  'Tot 3 dagen in de koelkast, smaakt de volgende dag vaak nog voller.',
  'Deze stoof is uitstekend een dag van tevoren te maken.',
  false
where not exists (select 1 from public.recipes where title = 'Fesenjan (Perzische kip in granaatappel-walnootsaus)');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Frisse mango-avocado salade met limoen',
  'Een tropisch frisse salade van rijpe mango, romige avocado, rode ui en limoen.',
  '["1 rijpe mango", "1 avocado", "1/4 rode ui", "verse koriander", "limoensap", "handvol rucola"]'::jsonb,
  'Snijd mango en avocado in blokjes, meng met fijngesneden rode ui en rucola en besprenkel met limoensap.',
  15,
  '{"vet": "16g", "eiwit": "3g", "calorieen": 240, "koolhydraten": "24g"}'::jsonb,
  '{"Lunch","Salade","Veganistisch","Glutenvrij","Snel","Vezelrijk"}'::text[],
  NULL,
  2,
  'makkelijk',
  '["Snijd de mango en avocado in blokjes.", "Snijd de rode ui zo fijn mogelijk.", "Meng mango, avocado, ui en rucola in een schaal.", "Besprenkel met flink wat limoensap en werk af met verse koriander."]'::jsonb,
  '["Chilipeper", "Geroosterde cashewnoten"]'::jsonb,
  'Gebruik minder mango en vul aan met extra rucola en komkommer.',
  'Het lekkerst vers bereid, avocado en mango verkleuren snel.',
  'Snijd de ui en kruiden vooraf, snijd mango en avocado pas vlak voor het serveren.',
  true
where not exists (select 1 from public.recipes where title = 'Frisse mango-avocado salade met limoen');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Gado-gado',
  'Een Indonesische groentesalade met licht gestoomde groenten, ei en een romige pindasaus.',
  '["handvol sperziebonen", "handvol taugé", "1/2 komkommer", "1 aardappel", "2 eieren", "3 el pindakaas", "sojasaus", "kokosmelk"]'::jsonb,
  'Stoom of blancheer de groenten, kook de aardappel en eieren en serveer met een romige pindasaus.',
  30,
  '{"vet": "22g", "eiwit": "16g", "calorieen": 380, "koolhydraten": "30g"}'::jsonb,
  '{"Lunch","Salade","Vegetarisch","Glutenvrij","Vezelrijk"}'::text[],
  NULL,
  2,
  'gemiddeld',
  '["Kook de aardappel gaar en snijd in plakjes.", "Blancheer de sperziebonen en taugé kort beetgaar.", "Kook de eieren hard en pel ze.", "Meng de pindakaas met een scheutje sojasaus, kokosmelk en warm water tot een gladde saus.", "Schik alle groenten, aardappel en ei op een bord en schenk de pindasaus erover."]'::jsonb,
  '["Kroepoek", "Gebakken tofu of tempeh"]'::jsonb,
  'Laat de aardappel weg en vul aan met extra komkommer en taugé.',
  'Bewaar de pindasaus apart, tot 3 dagen in de koelkast.',
  'Kook aardappel en eieren vooraf en stoom de groenten vlak voor het eten.',
  false
where not exists (select 1 from public.recipes where title = 'Gado-gado');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Gazpacho Andaluz',
  'Een koude Spaanse tomatensoep vol frisse groenten — perfect als lichte lunch op een warme dag.',
  '["6 rijpe tomaten", "1 komkommer", "1 groene paprika", "1 teentje knoflook", "2 el olijfolie", "scheutje sherryazijn", "sneetje oud brood"]'::jsonb,
  'Blend alle groenten met brood, olijfolie en azijn glad en laat goed koud worden in de koelkast.',
  20,
  '{"vet": "6g", "eiwit": "3g", "calorieen": 140, "koolhydraten": "18g"}'::jsonb,
  '{"Lunch","Soep","Veganistisch","Snel","Vezelrijk"}'::text[],
  NULL,
  4,
  'makkelijk',
  '["Snijd de tomaten, komkommer, paprika en knoflook grof.", "Blend alles samen met het brood, olijfolie en sherryazijn tot een gladde soep.", "Breng op smaak met zout en peper.", "Laat minstens 2 uur koud worden in de koelkast.", "Serveer koud, eventueel met wat fijngesneden groenten erbovenop."]'::jsonb,
  '["Extra olijfolie als garnering", "Fijngesneden groenten erbovenop"]'::jsonb,
  'Laat het brood weg en vul aan met extra olijfolie voor binding.',
  'Tot 3 dagen in de koelkast, goed afgedekt.',
  'Maak een grote kan vooraf — gazpacho wordt lekkerder als de smaken even kunnen trekken.',
  true
where not exists (select 1 from public.recipes where title = 'Gazpacho Andaluz');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Gezouten karamel-notenmix',
  'Een zelfgemaakte, magnesiumrijke notenmix met een vleugje zeezout en een hint van karamel.',
  '["150g gemengde noten (amandel, cashew, walnoot)", "2 el ahornsiroop", "1 tl kaneel", "grof zeezout"]'::jsonb,
  'Meng de noten met ahornsiroop en kaneel en rooster ze knapperig in de oven, werk af met zeezout.',
  20,
  '{"vet": "17g", "eiwit": "6g", "calorieen": 210, "koolhydraten": "10g"}'::jsonb,
  '{"Snack","Veganistisch","Glutenvrij","Lactosevrij","Magnesiumrijk","Voorbereiden"}'::text[],
  NULL,
  6,
  'makkelijk',
  '["Verwarm de oven voor op 180°C.", "Meng de noten met ahornsiroop en kaneel.", "Verdeel op een bakplaat met bakpapier.", "Rooster 10-12 minuten tot goudbruin, roer halverwege om.", "Bestrooi direct na de oven met grof zeezout en laat afkoelen tot krokant."]'::jsonb,
  '["Pompoenpitten", "Rozijnen"]'::jsonb,
  'Laat de ahornsiroop weg en rooster de noten puur met zout voor minder koolhydraten.',
  'Tot 2 weken in een afgesloten pot op kamertemperatuur.',
  'Maak een grote batch — deze notenmix is ideaal om in porties mee te nemen.',
  false
where not exists (select 1 from public.recipes where title = 'Gezouten karamel-notenmix');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Griekse boerensalade (Horiatiki)',
  'De originele Griekse salade zonder sla: rijpe tomaat, komkommer, rode ui, olijven en een plak feta.',
  '["4 rijpe tomaten", "1 komkommer", "1/2 rode ui", "handvol zwarte olijven", "150g feta in een plak", "olijfolie", "oregano"]'::jsonb,
  'Snijd de groenten in grove stukken, leg de feta erop en besprenkel met olijfolie en oregano.',
  15,
  '{"vet": "24g", "eiwit": "12g", "calorieen": 320, "koolhydraten": "12g"}'::jsonb,
  '{"Lunch","Salade","Vegetarisch","Glutenvrij","Snel"}'::text[],
  NULL,
  2,
  'makkelijk',
  '["Snijd de tomaten, komkommer en rode ui in grove stukken.", "Meng de groenten met de olijven in een schaal.", "Leg de plak feta bovenop.", "Besprenkel met olijfolie en bestrooi met gedroogde oregano en een snufje zout."]'::jsonb,
  '["Kappertjes", "Groene paprika"]'::jsonb,
  'Deze salade is van nature al koolhydraatarm.',
  'Het lekkerst vers, de groenten worden waterig als de salade te lang blijft staan.',
  'Snijd de groenten vooraf en meng pas vlak voor het serveren met de dressing.',
  false
where not exists (select 1 from public.recipes where title = 'Griekse boerensalade (Horiatiki)');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Griekse fakes (linzensoep)',
  'Een eenvoudige, rustieke Griekse linzensoep op basis van tomaat, laurier en een scheut rode wijnazijn.',
  '["250g bruine linzen", "1 blik tomatenblokjes", "1 ui", "2 teentjes knoflook", "1 wortel", "laurierblad", "rode wijnazijn", "olijfolie"]'::jsonb,
  'Fruit ui, knoflook en wortel aan, voeg linzen, tomaat en water toe en laat 30 minuten sudderen tot de linzen gaar zijn.',
  40,
  '{"vet": "6g", "eiwit": "16g", "calorieen": 260, "koolhydraten": "38g"}'::jsonb,
  '{"Diner","Lunch","Soep","Veganistisch","Glutenvrij","IJzerrijk","Voorbereiden"}'::text[],
  NULL,
  4,
  'makkelijk',
  '["Fruit de fijngesneden ui, knoflook en wortel aan in olijfolie.", "Voeg de linzen, tomatenblokjes, laurierblad en ruim water toe.", "Breng aan de kook en laat 30 minuten zachtjes sudderen.", "Breng op smaak met zout, peper en een scheut rode wijnazijn.", "Serveer met een extra scheut olijfolie erover."]'::jsonb,
  '["Feta erbij", "Extra knoflook", "Verse oregano"]'::jsonb,
  'Voeg extra groenten toe en gebruik iets minder linzen voor een lagere koolhydraatinname.',
  'Tot 4 dagen in de koelkast en goed in te vriezen.',
  'Maak een dubbele portie — deze soep smaakt de volgende dag vaak nog beter.',
  true
where not exists (select 1 from public.recipes where title = 'Griekse fakes (linzensoep)');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Griekse gegrilde vis met citroen en oregano',
  'Eenvoudig bereide witvis met citroen, olijfolie en oregano — een Griekse klassieker vol smaak.',
  '["2 zeebaarsfilets", "1 citroen", "2 el olijfolie", "gedroogde oregano", "1 teentje knoflook"]'::jsonb,
  'Marineer de vis kort in citroen, olijfolie en oregano en gril of bak tot gaar.',
  20,
  '{"vet": "16g", "eiwit": "32g", "calorieen": 280, "koolhydraten": "3g"}'::jsonb,
  '{"Diner","Glutenvrij","Lactosevrij","Eiwitrijk","Antioxidantrijk","Snel"}'::text[],
  NULL,
  2,
  'makkelijk',
  '["Meng olijfolie, citroensap, oregano en fijngehakte knoflook tot een marinade.", "Leg de visfilets erin en laat 10 minuten marineren.", "Bak of gril de vis 3-4 minuten per kant tot gaar en glazig van binnen.", "Besprenkel met extra citroensap voor het serveren."]'::jsonb,
  '["Verse peterselie", "Cherrytomaatjes erbij"]'::jsonb,
  'Dit gerecht is van nature al koolhydraatarm.',
  'Het lekkerst vers bereid en direct gegeten.',
  'Maak de marinade vooraf, dan hoeft de vis alleen nog gebakken te worden.',
  false
where not exists (select 1 from public.recipes where title = 'Griekse gegrilde vis met citroen en oregano');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Griekse moussaka',
  'Een klassieke Griekse ovenschotel van gebakken aubergine, gekruid gehakt en een romige bechamelsaus.',
  '["2 aubergines", "400g lamsgehakt of rundergehakt", "1 blik tomatenblokjes", "1 ui", "500ml melk", "40g bloem", "40g boter", "geraspte kaas"]'::jsonb,
  'Bak de aubergine, maak een gehaktsaus met tomaat, maak een bechamelsaus en laag alles in een ovenschaal, bak af in de oven.',
  75,
  '{"vet": "32g", "eiwit": "26g", "calorieen": 480, "koolhydraten": "24g"}'::jsonb,
  '{"Diner","Ovengerecht","Eiwitrijk","Voorbereiden"}'::text[],
  NULL,
  6,
  'pittig',
  '["Snijd de aubergine in plakken en bak ze aan beide kanten goudbruin.", "Bak het gehakt rul met ui en tomatenblokjes tot een dikke saus, kruid met kaneel.", "Maak een bechamelsaus van boter, bloem en melk, breng op smaak met nootmuskaat.", "Laag de aubergine en gehaktsaus in een ovenschaal en schenk de bechamel erover.", "Bestrooi met kaas en bak 35 minuten op 190°C tot goudbruin."]'::jsonb,
  '["Kaneel", "Nootmuskaat"]'::jsonb,
  'Vervang de bechamelsaus door een dunnere laag geraspte kaas voor minder koolhydraten.',
  'Tot 3 dagen in de koelkast, en uitstekend in te vriezen in porties.',
  'Bereid de hele schotel een dag van tevoren en bak af vlak voor het serveren.',
  false
where not exists (select 1 from public.recipes where title = 'Griekse moussaka');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Griekse yoghurt-chocolademousse',
  'Een luchtige, eiwitrijke chocolademousse van Griekse yoghurt en pure cacao — zoet genoeg zonder overdaad aan suiker.',
  '["300g Griekse yoghurt", "3 el pure cacaopoeder", "2 el honing", "snufje zeezout"]'::jsonb,
  'Meng de yoghurt met cacao, honing en een snufje zout tot een gladde mousse.',
  10,
  '{"vet": "4g", "eiwit": "14g", "calorieen": 180, "koolhydraten": "18g"}'::jsonb,
  '{"Dessert","Snack","Vegetarisch","Glutenvrij","Eiwitrijk","Snel"}'::text[],
  NULL,
  2,
  'makkelijk',
  '["Roer de cacaopoeder en honing door de Griekse yoghurt tot een gladde massa.", "Voeg een snufje zeezout toe voor extra diepte.", "Verdeel over glaasjes.", "Laat 15 minuten opstijven in de koelkast en werk eventueel af met fruit."]'::jsonb,
  '["Frambozen", "Chocoladeschaafsel"]'::jsonb,
  'Gebruik minder honing voor een minder zoete, koolhydraatarmere versie.',
  'Tot 2 dagen in de koelkast.',
  'Maak een grotere portie vooraf in aparte glaasjes voor een klaarstaand toetje.',
  true
where not exists (select 1 from public.recipes where title = 'Griekse yoghurt-chocolademousse');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Gyudon (Japanse rundvlees-rijstbowl)',
  'Dungesneden rundvlees en ui, langzaam getrokken in een zoethartige sojasaus, geserveerd over warme rijst.',
  '["250g dungesneden rundvlees", "1 ui", "200g rijst", "sojasaus", "mirin", "1 el suiker", "dashi of runderbouillon"]'::jsonb,
  'Kook de rijst, laat ui en vlees garen in de zoethartige bouillon en schep over de rijst.',
  25,
  '{"vet": "16g", "eiwit": "30g", "calorieen": 520, "koolhydraten": "62g"}'::jsonb,
  '{"Diner","Bowl","IJzerrijk","Eiwitrijk"}'::text[],
  NULL,
  2,
  'makkelijk',
  '["Kook de rijst volgens de verpakking.", "Snijd de ui in dunne halve ringen en breng aan de kook in sojasaus, mirin, suiker en bouillon.", "Laat de ui 5 minuten meesudderen tot zacht.", "Voeg het dungesneden rundvlees toe en laat 3-4 minuten garen in de saus.", "Verdeel de rijst over kommen en schep het vlees met saus erover.", "Werk af met lente-ui."]'::jsonb,
  '["Gepofte ei", "Gemberreepjes", "Lente-ui"]'::jsonb,
  'Vervang de helft van de rijst door bloemkoolrijst voor minder koolhydraten.',
  'Tot 2 dagen in de koelkast, apart van de rijst bewaren voor de beste textuur.',
  'Snijd het vlees en de ui vooraf — dit gerecht staat dan in 15 minuten op tafel.',
  false
where not exists (select 1 from public.recipes where title = 'Gyudon (Japanse rundvlees-rijstbowl)');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Hartige kaas-zadencrackers',
  'Knapperige, zelfgemaakte crackers van geraspte kaas en gemengde zaden — een hartige snack tegen de trek.',
  '["150g geraspte oude kaas", "3 el lijnzaad", "3 el sesamzaad", "2 el zonnebloempitten", "1 ei"]'::jsonb,
  'Meng kaas, zaden en ei tot een deeg, rol dun uit en bak knapperig in de oven.',
  30,
  '{"vet": "12g", "eiwit": "9g", "calorieen": 150, "koolhydraten": "3g"}'::jsonb,
  '{"Snack","Vegetarisch","Glutenvrij","Eiwitrijk","Magnesiumrijk","Voorbereiden"}'::text[],
  NULL,
  6,
  'makkelijk',
  '["Verwarm de oven voor op 180°C.", "Meng de geraspte kaas, alle zaden en het ei tot een samenhangend deeg.", "Rol het deeg dun uit tussen twee vellen bakpapier.", "Snijd in vierkantjes en leg op een bakplaat.", "Bak 12-15 minuten tot goudbruin en krokant."]'::jsonb,
  '["Chilivlokken", "Kruiden naar smaak"]'::jsonb,
  'Deze crackers zijn van nature al koolhydraatarm.',
  'Tot een week in een afgesloten bakje.',
  'Bak een dubbele batch — deze crackers blijven goed knapperig in een afgesloten pot.',
  false
where not exists (select 1 from public.recipes where title = 'Hartige kaas-zadencrackers');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Hongaarse goulash met aardappelen',
  'Een stevige Hongaarse rundvleesstoof op smaak gebracht met paprikapoeder en komijn.',
  '["600g runderstoofvlees", "3 el paprikapoeder", "2 uien", "2 paprikas", "500g aardappelen", "1 blik tomatenblokjes", "runderbouillon"]'::jsonb,
  'Fruit de uien, bak het vlees aan met paprikapoeder, voeg tomaat, bouillon en paprika toe en laat 1,5 uur sudderen, voeg de aardappel later toe.',
  120,
  '{"vet": "18g", "eiwit": "34g", "calorieen": 460, "koolhydraten": "34g"}'::jsonb,
  '{"Diner","Glutenvrij","Eiwitrijk","Magnesiumrijk","Voorbereiden"}'::text[],
  NULL,
  4,
  'gemiddeld',
  '["Fruit de uien glazig in een scheutje olie.", "Bak het rundvlees aan en bestrooi rijkelijk met paprikapoeder.", "Voeg de tomatenblokjes, bouillon en in reepjes gesneden paprika toe.", "Laat afgedekt 1 tot 1,5 uur zachtjes sudderen tot het vlees mals is.", "Voeg de in blokjes gesneden aardappelen toe en kook nog 20 minuten mee tot gaar."]'::jsonb,
  '["Zure room", "Kummel (komijnzaad)"]'::jsonb,
  'Gebruik minder aardappel en vul aan met extra paprika en courgette.',
  'Tot 4 dagen in de koelkast, en uitstekend in te vriezen.',
  'Maak een dubbele portie — goulash smaakt de volgende dag vaak nog voller.',
  false
where not exists (select 1 from public.recipes where title = 'Hongaarse goulash met aardappelen');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Kaasplankje met noten en honing',
  'Een hartig-zoet snackbord van verschillende kazen, noten, druiven en een drupje honing — voelt als een traktatie.',
  '["150g gemengde kaas (oud, brie, geitenkaas)", "handvol walnoten", "handvol druiven", "honing", "knapperige crackers"]'::jsonb,
  'Schik de kaas, noten en druiven op een plank en besprenkel de zachte kaas met honing.',
  10,
  '{"vet": "24g", "eiwit": "18g", "calorieen": 380, "koolhydraten": "22g"}'::jsonb,
  '{"Snack","Vegetarisch","Eiwitrijk","Snel"}'::text[],
  NULL,
  2,
  'makkelijk',
  '["Snijd de kazen in stukken en schik op een plank of bord.", "Voeg de walnoten en druiven toe.", "Besprenkel de brie of geitenkaas met een beetje honing.", "Serveer met knapperige crackers erbij."]'::jsonb,
  '["Gedroogde vijgen", "Augurkjes"]'::jsonb,
  'Laat de crackers en honing weg en houd het bij kaas, noten en druiven.',
  'Het lekkerst vers samengesteld, kort voor het serveren.',
  'Snijd de kaas vooraf en bewaar afgedekt tot je klaar bent om te serveren.',
  false
where not exists (select 1 from public.recipes where title = 'Kaasplankje met noten en honing');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Kikkererwten-brownies',
  'Verrassend romige, glutenvrije brownies gemaakt op basis van kikkererwten en pure cacao.',
  '["1 blik kikkererwten", "3 el pure cacaopoeder", "80g pindakaas", "60g honing", "1 tl bakpoeder", "handvol pure chocoladestukjes"]'::jsonb,
  'Blend alle ingrediënten glad, giet in een ovenschaal en bak tot gaar.',
  40,
  '{"vet": "8g", "eiwit": "6g", "calorieen": 160, "koolhydraten": "18g"}'::jsonb,
  '{"Dessert","Snack","Vegetarisch","Glutenvrij","Magnesiumrijk","Vezelrijk","Voorbereiden"}'::text[],
  NULL,
  9,
  'makkelijk',
  '["Verwarm de oven voor op 175°C.", "Doe de uitgelekte kikkererwten, cacaopoeder, pindakaas, honing en bakpoeder in een blender.", "Blend tot een glad beslag.", "Roer de chocoladestukjes erdoor en giet het beslag in een ingevette ovenschaal.", "Bak 20-25 minuten tot gaar en laat volledig afkoelen voor het snijden."]'::jsonb,
  '["Walnoten", "Extra chocoladestukjes bovenop"]'::jsonb,
  'Gebruik iets minder honing en meer pure chocolade (85%) voor minder koolhydraten.',
  'Tot 4 dagen in een afgesloten bakje, en goed in te vriezen in stukken.',
  'Bak een grote bakplaat en vries de brownies in porties in.',
  true
where not exists (select 1 from public.recipes where title = 'Kikkererwten-brownies');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Kleurrijke groentecurry met kokosmelk',
  'Een milde, romige curry vol gekleurde groenten in kokosmelk, geïnspireerd op Indiase korma.',
  '["1 blik kokosmelk", "1 bloemkool", "1 wortel", "handvol sperziebonen", "1 rode paprika", "1 el kerriepasta", "1 ui", "cashewnoten"]'::jsonb,
  'Fruit de ui en kerriepasta, voeg de groenten en kokosmelk toe en laat sudderen tot de groenten gaar zijn.',
  35,
  '{"vet": "26g", "eiwit": "9g", "calorieen": 340, "koolhydraten": "22g"}'::jsonb,
  '{"Diner","Curry","Vegetarisch","Veganistisch","Glutenvrij","Antioxidantrijk","Vezelrijk"}'::text[],
  NULL,
  3,
  'makkelijk',
  '["Fruit de ui aan in een scheutje olie.", "Voeg de kerriepasta toe en bak 1 minuut mee.", "Voeg de in stukken gesneden groenten en de kokosmelk toe.", "Laat 15-20 minuten sudderen tot de groenten gaar zijn.", "Werk af met cashewnoten en verse koriander."]'::jsonb,
  '["Verse koriander", "Rijst erbij"]'::jsonb,
  'Gebruik magere kokosmelk (light) voor minder vet, de koolhydraten zijn al laag.',
  'Tot 3 dagen in de koelkast en goed in te vriezen.',
  'Maak een dubbele portie — deze curry smaakt de volgende dag vaak nog beter.',
  true
where not exists (select 1 from public.recipes where title = 'Kleurrijke groentecurry met kokosmelk');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Koreaanse dak-doritang (gestoofde kip met aardappel)',
  'Een pittig-zoete Koreaanse kipstoof met aardappel, wortel en gochujang.',
  '["4 kipdrumsticks", "2 aardappelen", "1 wortel", "2 el gochujang", "1 el sojasaus", "1 el honing", "2 teentjes knoflook"]'::jsonb,
  'Bak de kip kort aan, voeg aardappel, wortel en de saus toe en laat sudderen tot de kip en groenten gaar zijn.',
  45,
  '{"vet": "18g", "eiwit": "32g", "calorieen": 460, "koolhydraten": "36g"}'::jsonb,
  '{"Diner","Glutenvrij","Eiwitrijk","Magnesiumrijk","Voorbereiden"}'::text[],
  NULL,
  3,
  'gemiddeld',
  '["Bak de kipdrumsticks kort aan in een scheutje olie.", "Meng gochujang, sojasaus, honing en knoflook tot een saus.", "Voeg de in stukken gesneden aardappel, wortel en de saus toe aan de kip met een scheutje water.", "Laat 25-30 minuten sudderen tot de kip en groenten gaar zijn en de saus indikt.", "Werk af met lente-ui en sesamzaad."]'::jsonb,
  '["Lente-ui", "Sesamzaad"]'::jsonb,
  'Gebruik minder aardappel en vul aan met extra wortel en paprika.',
  'Tot 3 dagen in de koelkast.',
  'Maak een dubbele portie — deze stoof smaakt de volgende dag vaak nog beter.',
  false
where not exists (select 1 from public.recipes where title = 'Koreaanse dak-doritang (gestoofde kip met aardappel)');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Koreaanse miyeok-guk met rundvlees',
  'Een traditionele Koreaanse zeewiersoep met rundvlees, rijk aan ijzer en jodium — in Korea klassiek als herstelsoep.',
  '["30g gedroogd zeewier (miyeok/wakame)", "200g rundvlees in reepjes", "2 teentjes knoflook", "1 el sesamolie", "sojasaus", "sesamzaad"]'::jsonb,
  'Week het zeewier, bak het rundvlees kort aan in sesamolie, voeg zeewier en water toe en laat 20 minuten sudderen.',
  35,
  '{"vet": "12g", "eiwit": "22g", "calorieen": 220, "koolhydraten": "6g"}'::jsonb,
  '{"Diner","Soep","Glutenvrij","Lactosevrij","IJzerrijk","Eiwitrijk"}'::text[],
  NULL,
  3,
  'makkelijk',
  '["Week het gedroogde zeewier 15 minuten in koud water en laat uitlekken.", "Bak het rundvlees met knoflook kort aan in sesamolie.", "Voeg het zeewier en een scheutje sojasaus toe en roerbak 2 minuten.", "Voeg ruim water toe en breng aan de kook.", "Laat 20 minuten zachtjes sudderen en breng op smaak met sojasaus.", "Werk af met sesamzaad."]'::jsonb,
  '["Extra knoflook", "Chilivlokken"]'::jsonb,
  'Deze soep is van nature al koolhydraatarm.',
  'Tot 3 dagen in de koelkast.',
  'Week een grotere hoeveelheid zeewier vooraf in en vries in porties in.',
  false
where not exists (select 1 from public.recipes where title = 'Koreaanse miyeok-guk met rundvlees');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Libanese adas bi hamod',
  'Een frisse Libanese linzensoep op smaak gebracht met citroen, knoflook en verse koriander, met spinazie erdoor.',
  '["250g bruine linzen", "150g spinazie", "1 ui", "3 teentjes knoflook", "citroensap", "verse koriander", "1 aardappel"]'::jsonb,
  'Kook linzen en aardappel gaar, fruit knoflook en ui, voeg samen met de spinazie en citroensap toe.',
  35,
  '{"vet": "4g", "eiwit": "15g", "calorieen": 240, "koolhydraten": "36g"}'::jsonb,
  '{"Diner","Lunch","Soep","Veganistisch","Glutenvrij","IJzerrijk"}'::text[],
  NULL,
  4,
  'makkelijk',
  '["Kook de linzen en in blokjes gesneden aardappel in ruim water in 20 minuten gaar.", "Fruit ondertussen ui en knoflook aan in een scheutje olie.", "Voeg het ui-knoflookmengsel toe aan de linzen.", "Roer de spinazie erdoor tot deze net geslonken is.", "Breng op smaak met flink wat citroensap, zout en verse koriander."]'::jsonb,
  '["Extra citroen", "Chilivlokken"]'::jsonb,
  'Gebruik iets minder aardappel en linzen en vul aan met extra spinazie.',
  'Tot 4 dagen in de koelkast en goed in te vriezen.',
  'Maak een grote pan vooraf — de smaken trekken er alleen maar verder in.',
  true
where not exists (select 1 from public.recipes where title = 'Libanese adas bi hamod');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Libanese tabouleh met quinoa',
  'Een frisse, kruidenrijke Libanese salade met veel peterselie en munt, hier gemaakt met quinoa voor extra eiwit en vezels.',
  '["120g quinoa", "grote bos peterselie", "verse munt", "3 tomaten", "1/2 rode ui", "citroensap", "olijfolie"]'::jsonb,
  'Kook de quinoa en laat afkoelen, hak de kruiden en groenten fijn en meng alles met citroensap en olijfolie.',
  25,
  '{"vet": "10g", "eiwit": "8g", "calorieen": 260, "koolhydraten": "34g"}'::jsonb,
  '{"Lunch","Salade","Veganistisch","Glutenvrij","Vezelrijk"}'::text[],
  NULL,
  3,
  'makkelijk',
  '["Kook de quinoa volgens de verpakking en laat afkoelen.", "Hak de peterselie en munt fijn.", "Snijd de tomaten en rode ui in kleine blokjes.", "Meng de quinoa met de kruiden en groenten.", "Besprenkel met flink wat citroensap en olijfolie en breng op smaak met zout."]'::jsonb,
  '["Komkommer", "Granaatappelpitten"]'::jsonb,
  'Gebruik iets minder quinoa en vul aan met extra peterselie en tomaat.',
  'Tot 2 dagen in de koelkast, hoe langer hoe meer de smaken intrekken.',
  'Kook de quinoa vooraf, dan staat deze salade in 10 minuten op tafel.',
  true
where not exists (select 1 from public.recipes where title = 'Libanese tabouleh met quinoa');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Loaded sweet potato fries met kaas en spek',
  'Krokante ovenfriet van zoete aardappel met gesmolten kaas, spekjes en een frisse yoghurtdip — hartig comfort food.',
  '["2 zoete aardappelen", "80g spekjes", "geraspte kaas", "Griekse yoghurt", "bieslook"]'::jsonb,
  'Snijd de zoete aardappel in reepjes, rooster krokant in de oven, bak de spekjes en overgiet alles met kaas en dip.',
  35,
  '{"vet": "20g", "eiwit": "16g", "calorieen": 380, "koolhydraten": "34g"}'::jsonb,
  '{"Snack","Bijgerecht","Comfort food","Glutenvrij","Eiwitrijk"}'::text[],
  NULL,
  3,
  'makkelijk',
  '["Verwarm de oven voor op 220°C.", "Snijd de zoete aardappel in dunne reepjes en rooster 20-25 minuten tot krokant.", "Bak de spekjes krokant in een pan.", "Verdeel de geraspte kaas over de frietjes en laat nog 3 minuten smelten in de oven.", "Verdeel de spekjes erover en serveer met een dip van Griekse yoghurt en bieslook."]'::jsonb,
  '["Jalapeño", "Lente-ui"]'::jsonb,
  'Gebruik minder zoete aardappel en vul aan met extra kaas en spek voor minder koolhydraten.',
  'Het lekkerst vers uit de oven, warm opnieuw op in de oven voor het krokante effect.',
  'Snijd de zoete aardappel vooraf, rooster vlak voor het serveren.',
  false
where not exists (select 1 from public.recipes where title = 'Loaded sweet potato fries met kaas en spek');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Marokkaanse couscoussalade met citroen en munt',
  'Een frisse couscoussalade met citroen, verse munt, granaatappelpitten en amandelen.',
  '["150g couscous", "1 citroen", "verse munt", "handvol granaatappelpitten", "handvol amandelen", "olijfolie", "1 komkommer"]'::jsonb,
  'Week de couscous in kokend water, meng met citroensap, munt, komkommer, granaatappelpitten en amandelen.',
  20,
  '{"vet": "13g", "eiwit": "8g", "calorieen": 320, "koolhydraten": "42g"}'::jsonb,
  '{"Lunch","Salade","Vegetarisch","Vezelrijk"}'::text[],
  NULL,
  3,
  'makkelijk',
  '["Overgiet de couscous met evenveel kokend water en laat 5 minuten afgedekt staan.", "Maak de couscous los met een vork.", "Voeg citroensap, olijfolie, gehakte munt en in blokjes gesneden komkommer toe.", "Meng er de granaatappelpitten en gehakte amandelen doorheen.", "Breng op smaak met zout en peper."]'::jsonb,
  '["Rozijnen", "Fetakaas"]'::jsonb,
  'Vervang de helft van de couscous door extra komkommer en kruiden.',
  'Tot 2 dagen in de koelkast.',
  'Maak een dubbele portie — deze salade is een fijne meeneemlunch voor een paar dagen.',
  false
where not exists (select 1 from public.recipes where title = 'Marokkaanse couscoussalade met citroen en munt');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Marokkaanse harira',
  'Een traditionele Marokkaanse soep met linzen, kikkererwten en lamsvlees, rijk aan ijzer en vaak gegeten om weer op krachten te komen.',
  '["150g rode linzen", "1 blik kikkererwten", "200g lamsvlees of rundergehakt", "1 blik tomatenblokjes", "1 ui", "2 stengels bleekselderij", "peterselie en koriander", "handvol vermicelli"]'::jsonb,
  'Fruit ui en selderij aan, voeg vlees, linzen, kikkererwten en tomaat toe en laat 30-40 minuten sudderen, voeg de vermicelli op het laatst toe.',
  50,
  '{"vet": "8g", "eiwit": "22g", "calorieen": 340, "koolhydraten": "40g"}'::jsonb,
  '{"Diner","Lunch","Soep","IJzerrijk","Eiwitrijk"}'::text[],
  NULL,
  4,
  'gemiddeld',
  '["Snijd de ui en bleekselderij fijn en fruit ze aan in een scheutje olie.", "Voeg het vlees toe en bak rondom bruin.", "Voeg tomatenblokjes, linzen, kikkererwten en ruim water of bouillon toe.", "Laat 30-40 minuten zachtjes sudderen tot de linzen gaar zijn.", "Voeg de vermicelli toe en kook nog 5 minuten mee.", "Werk af met verse peterselie, koriander en een partje citroen."]'::jsonb,
  '["Verse gember", "Kaneel", "Partjes citroen"]'::jsonb,
  'Laat de vermicelli weg en vul aan met extra kikkererwten en groenten.',
  'Tot 3 dagen in de koelkast, smaakt opgewarmd vaak intenser.',
  'Maak een grote pan en vries in porties in zonder de vermicelli — voeg die pas toe bij het opwarmen.',
  true
where not exists (select 1 from public.recipes where title = 'Marokkaanse harira');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Marokkaanse kikkererwtentajine met zoete aardappel',
  'Een verzadigende, kruidige Marokkaanse ovenschotel van kikkererwten, zoete aardappel en gedroogde pruimen.',
  '["2 blikken kikkererwten", "2 zoete aardappelen", "handvol gedroogde pruimen", "1 ui", "1 tl kaneel", "1 tl komijnpoeder", "groentebouillon"]'::jsonb,
  'Fruit ui en specerijen, voeg kikkererwten, zoete aardappel, pruimen en bouillon toe en laat sudderen tot de aardappel gaar is.',
  45,
  '{"vet": "8g", "eiwit": "12g", "calorieen": 360, "koolhydraten": "58g"}'::jsonb,
  '{"Diner","Ovengerecht","Veganistisch","Glutenvrij","Magnesiumrijk","Vezelrijk"}'::text[],
  NULL,
  4,
  'makkelijk',
  '["Fruit de ui aan met kaneel en komijn in een scheutje olie.", "Voeg de kikkererwten, in blokjes gesneden zoete aardappel en pruimen toe.", "Voeg bouillon toe tot alles net onderstaat.", "Laat 25-30 minuten sudderen tot de zoete aardappel gaar is.", "Werk af met verse koriander."]'::jsonb,
  '["Amandelen", "Verse koriander"]'::jsonb,
  'Gebruik minder zoete aardappel en pruimen en vul aan met extra kikkererwten en groenten.',
  'Tot 4 dagen in de koelkast en goed in te vriezen.',
  'Maak een dubbele portie — deze tajine smaakt de volgende dag vaak nog voller.',
  true
where not exists (select 1 from public.recipes where title = 'Marokkaanse kikkererwtentajine met zoete aardappel');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Marokkaanse kip met abrikozen en amandelen',
  'Een milde, kleurrijke Marokkaanse tajine-stijl stoof van kip met gedroogde abrikozen, amandelen en kaneel.',
  '["4 kipdijfilets", "handvol gedroogde abrikozen", "handvol amandelen", "1 ui", "1 tl kaneel", "1 tl komijnpoeder", "kippenbouillon"]'::jsonb,
  'Fruit ui en specerijen, bak de kip aan, voeg abrikozen, amandelen en bouillon toe en laat 30 minuten sudderen.',
  45,
  '{"vet": "22g", "eiwit": "30g", "calorieen": 420, "koolhydraten": "22g"}'::jsonb,
  '{"Diner","Glutenvrij","Lactosevrij","Eiwitrijk","Antioxidantrijk"}'::text[],
  NULL,
  4,
  'gemiddeld',
  '["Fruit de ui aan met kaneel en komijn in een scheutje olie.", "Bak de kipdijfilets rondom aan.", "Voeg de abrikozen, amandelen en bouillon toe.", "Laat afgedekt 30 minuten zachtjes sudderen tot de kip gaar is.", "Werk af met verse koriander."]'::jsonb,
  '["Verse koriander", "Couscous erbij"]'::jsonb,
  'Gebruik minder abrikozen en vul aan met extra groenten zoals courgette.',
  'Tot 3 dagen in de koelkast en goed in te vriezen.',
  'Maak een dubbele portie — de smaken worden de volgende dag alleen maar voller.',
  false
where not exists (select 1 from public.recipes where title = 'Marokkaanse kip met abrikozen en amandelen');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Mexicaanse bonen bowl met mangosalsa',
  'Een kleurrijke bowl van zwarte bonen, rijst, avocado en een frisse mangosalsa.',
  '["1 blik zwarte bonen", "150g rijst", "1 avocado", "1 mango", "1/2 rode ui", "verse koriander", "limoensap"]'::jsonb,
  'Kook de rijst, maak de mangosalsa en verdeel alles met de bonen en avocado over kommen.',
  25,
  '{"vet": "14g", "eiwit": "13g", "calorieen": 420, "koolhydraten": "62g"}'::jsonb,
  '{"Diner","Bowl","Veganistisch","Glutenvrij","Antioxidantrijk","Vezelrijk"}'::text[],
  NULL,
  2,
  'makkelijk',
  '["Kook de rijst volgens de verpakking.", "Verwarm de zwarte bonen kort met een snufje komijn en zout.", "Snijd de mango en rode ui fijn en meng met koriander en limoensap tot een salsa.", "Snijd de avocado in plakjes.", "Verdeel rijst, bonen, avocado en mangosalsa over kommen."]'::jsonb,
  '["Gegrilde mais", "Zure room"]'::jsonb,
  'Vervang een deel van de rijst door extra sla en groenten voor minder koolhydraten.',
  'Bewaar de onderdelen apart, tot 2 dagen in de koelkast.',
  'Kook de rijst en bonen vooraf en stel de bowl pas samen vlak voor het eten.',
  true
where not exists (select 1 from public.recipes where title = 'Mexicaanse bonen bowl met mangosalsa');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Mexicaanse chili con carne',
  'Een stevige, kruidige Mexicaans-Tex-Mex stoof van rundergehakt, bonen en tomaat.',
  '["400g rundergehakt", "1 blik kidneybonen", "1 blik tomatenblokjes", "1 ui", "2 teentjes knoflook", "1 el chilipoeder", "1 tl komijnpoeder", "1 paprika"]'::jsonb,
  'Bak het gehakt rul, fruit ui, knoflook en paprika mee, voeg bonen, tomaat en kruiden toe en laat 25 minuten sudderen.',
  40,
  '{"vet": "18g", "eiwit": "30g", "calorieen": 380, "koolhydraten": "22g"}'::jsonb,
  '{"Diner","Eiwitrijk","Glutenvrij","IJzerrijk","Voorbereiden"}'::text[],
  NULL,
  4,
  'makkelijk',
  '["Bak het rundergehakt rul in een grote pan.", "Voeg ui, knoflook en paprika toe en bak nog 3 minuten mee.", "Voeg de kidneybonen, tomatenblokjes, chilipoeder en komijn toe.", "Laat 25 minuten zachtjes sudderen tot een dikke saus ontstaat.", "Breng op smaak met zout en peper."]'::jsonb,
  '["Avocado", "Zure room", "Geraspte kaas"]'::jsonb,
  'Gebruik iets minder bonen en vul aan met extra paprika en courgette voor minder koolhydraten.',
  'Tot 4 dagen in de koelkast, en uitstekend in te vriezen.',
  'Maak een dubbele portie — chili smaakt de volgende dag vaak nog beter.',
  true
where not exists (select 1 from public.recipes where title = 'Mexicaanse chili con carne');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Miso-soep met tofu en wakame',
  'Een lichte, gefermenteerde Japanse soep van misopasta, zijdezachte tofu en wakame-zeewier.',
  '["3 el misopasta", "200g zijdezachte tofu", "10g gedroogd wakame", "1L dashi of groentebouillon", "lente-ui"]'::jsonb,
  'Breng de bouillon aan de kook, week het wakame, los de miso apart op en voeg samen met de tofu toe.',
  15,
  '{"vet": "6g", "eiwit": "9g", "calorieen": 120, "koolhydraten": "8g"}'::jsonb,
  '{"Lunch","Soep","Veganistisch","Snel","Vezelrijk"}'::text[],
  NULL,
  2,
  'makkelijk',
  '["Week het wakame kort in water en laat uitlekken.", "Breng de dashi of groentebouillon zachtjes aan de kook.", "Los de misopasta op in een beetje van de warme bouillon en roer terug in de pan.", "Voeg de tofu in blokjes en het wakame toe en verwarm nog 2 minuten mee — niet meer koken.", "Werk af met fijngesneden lente-ui."]'::jsonb,
  '["Extra tofu", "Chilivlokken"]'::jsonb,
  'Deze soep is van nature al koolhydraatarm.',
  'Het lekkerst vers — miso verliest smaak als het te lang doorkookt of blijft staan.',
  'Zet de dashi vooraf klaar, dan staat deze soep in 5 minuten op tafel.',
  true
where not exists (select 1 from public.recipes where title = 'Miso-soep met tofu en wakame');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Mujadara (linzen met rijst en gekarameliseerde ui)',
  'Een eenvoudig Libanees gerecht van linzen en rijst, afgemaakt met een dikke laag krokant gekarameliseerde ui.',
  '["150g bruine linzen", "150g rijst", "3 uien", "komijnpoeder", "olijfolie"]'::jsonb,
  'Kook de linzen half gaar, voeg de rijst toe en gaar verder, karamelliseer de ui apart krokant en schep erover.',
  45,
  '{"vet": "9g", "eiwit": "13g", "calorieen": 380, "koolhydraten": "62g"}'::jsonb,
  '{"Diner","Rijst","Veganistisch","Glutenvrij","Magnesiumrijk","Vezelrijk","Voorbereiden"}'::text[],
  NULL,
  4,
  'makkelijk',
  '["Kook de linzen 10 minuten voor in ruim water.", "Voeg de rijst en komijnpoeder toe met vers water en kook nog 15-18 minuten tot beide gaar zijn.", "Snijd de uien in dunne ringen en bak ze langzaam in olijfolie tot diepbruin en krokant.", "Verdeel de linzen-rijst over borden.", "Schep de krokante ui erover."]'::jsonb,
  '["Griekse yoghurt erbij", "Verse peterselie"]'::jsonb,
  'Gebruik iets minder rijst en vul aan met extra linzen en groenten.',
  'Tot 4 dagen in de koelkast.',
  'Maak een grote pan — mujadara is ook koud of opgewarmd erg lekker.',
  true
where not exists (select 1 from public.recipes where title = 'Mujadara (linzen met rijst en gekarameliseerde ui)');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Overnight chia pudding met perzik en amandel',
  'Een romige, vezelrijke ontbijtpudding van chiazaad in plantaardige melk, met verse perzik en amandelschaafsel.',
  '["4 el chiazaad", "250ml amandelmelk", "1 perzik", "handvol amandelschaafsel", "1 tl ahornsiroop"]'::jsonb,
  'Meng chiazaad met amandelmelk en ahornsiroop, laat een nacht opstijven en top af met perzik en amandel.',
  10,
  '{"vet": "16g", "eiwit": "8g", "calorieen": 280, "koolhydraten": "24g"}'::jsonb,
  '{"Ontbijt","Veganistisch","Glutenvrij","Lactosevrij","Vezelrijk","Voorbereiden"}'::text[],
  NULL,
  1,
  'makkelijk',
  '["Meng het chiazaad met de amandelmelk en ahornsiroop in een potje.", "Roer goed door en laat 5 minuten staan, roer nogmaals door om klontjes te voorkomen.", "Dek af en laat minimaal een nacht in de koelkast opstijven.", "Snijd de perzik in partjes en top de pudding ermee af.", "Werk af met amandelschaafsel."]'::jsonb,
  '["Kaneel", "Extra fruit"]'::jsonb,
  'Gebruik minder ahornsiroop en kies voor bessen in plaats van perzik.',
  'Tot 3 dagen in een afgesloten pot in de koelkast.',
  'Maak meteen 3-4 potjes voor de hele week.',
  false
where not exists (select 1 from public.recipes where title = 'Overnight chia pudding met perzik en amandel');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Paella met zeevruchten',
  'Een kleurrijke Spaanse rijstschotel met saffraan, garnalen, mosselen en paprika.',
  '["300g paellarijst", "300g gemengde zeevruchten", "1 rode paprika", "1 ui", "2 teentjes knoflook", "saffraandraadjes", "visbouillon", "handvol doperwten"]'::jsonb,
  'Fruit ui, knoflook en paprika, bak de rijst kort mee met saffraan, voeg bouillon toe en laat garen, voeg de zeevruchten op het laatst toe.',
  40,
  '{"vet": "8g", "eiwit": "26g", "calorieen": 420, "koolhydraten": "54g"}'::jsonb,
  '{"Diner","Rijst","Glutenvrij","Lactosevrij","Antioxidantrijk"}'::text[],
  NULL,
  4,
  'gemiddeld',
  '["Fruit de ui, knoflook en in reepjes gesneden paprika aan in olijfolie.", "Voeg de rijst toe en bak 2 minuten mee tot glazig.", "Los de saffraan op in wat warme bouillon en voeg samen met de rest van de bouillon toe.", "Laat 15-18 minuten zachtjes garen zonder te roeren.", "Verdeel de zeevruchten en doperwten over de rijst en laat de laatste 5 minuten meegaren.", "Serveer met partjes citroen."]'::jsonb,
  '["Citroenpartjes", "Verse peterselie"]'::jsonb,
  'Vervang een deel van de rijst door bloemkoolrijst voor minder koolhydraten.',
  'Tot 2 dagen in de koelkast, warm rustig op zodat de zeevruchten niet taai worden.',
  'Bereid de bouillon en groenten vooraf, de rijst kook je het best vlak voor het serveren.',
  false
where not exists (select 1 from public.recipes where title = 'Paella met zeevruchten');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Palak paneer',
  'Een romige Indiase curry van gepureerde spinazie met blokjes paneer — een klassieker vol ijzer en calcium.',
  '["300g spinazie", "200g paneer", "1 ui", "2 teentjes knoflook", "1 tomaat", "1 tl komijnzaad", "1 tl garam masala", "scheutje room of kokosmelk"]'::jsonb,
  'Blancheer en pureer de spinazie, fruit ui en specerijen, voeg de spinaziepuree en paneer toe en laat kort sudderen.',
  30,
  '{"vet": "27g", "eiwit": "20g", "calorieen": 380, "koolhydraten": "12g"}'::jsonb,
  '{"Diner","Curry","Vegetarisch","Glutenvrij","IJzerrijk"}'::text[],
  NULL,
  3,
  'gemiddeld',
  '["Blancheer de spinazie kort in kokend water en pureer met een staafmixer.", "Fruit de ui, knoflook en komijnzaad aan in een scheutje olie.", "Voeg de tomaat en garam masala toe en bak kort mee.", "Roer de spinaziepuree erdoor en laat 5 minuten sudderen.", "Voeg de blokjes paneer en een scheutje room toe en verwarm nog 3-4 minuten mee."]'::jsonb,
  '["Verse gember", "Chilipoeder", "Rijst erbij"]'::jsonb,
  'Deze curry is van nature al koolhydraatarm — serveer met bloemkoolrijst in plaats van gewone rijst.',
  'Tot 3 dagen in de koelkast.',
  'De spinaziesaus is goed vooraf te maken en apart in te vriezen; voeg de paneer pas toe bij het opwarmen.',
  false
where not exists (select 1 from public.recipes where title = 'Palak paneer');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Panzanella (Toscaanse broodsalade)',
  'Een Italiaanse zomerse broodsalade van geroosterd brood, rijpe tomaten, komkommer en rode ui.',
  '["3 sneetjes oud brood", "4 rijpe tomaten", "1/2 komkommer", "1/2 rode ui", "verse basilicum", "olijfolie", "rode wijnazijn"]'::jsonb,
  'Rooster het brood, snijd de groenten en meng alles met olijfolie, azijn en basilicum.',
  20,
  '{"vet": "12g", "eiwit": "6g", "calorieen": 260, "koolhydraten": "32g"}'::jsonb,
  '{"Lunch","Salade","Vegetarisch","Snel"}'::text[],
  NULL,
  3,
  'makkelijk',
  '["Snijd of scheur het brood in stukken en rooster ze knapperig in de oven of een droge pan.", "Snijd de tomaten, komkommer en rode ui in stukken.", "Meng het geroosterde brood met de groenten.", "Voeg olijfolie, rode wijnazijn en verse basilicum toe en meng goed.", "Laat 10 minuten staan zodat het brood de smaken opneemt."]'::jsonb,
  '["Kappertjes", "Ansjovis"]'::jsonb,
  'Gebruik minder brood en vul aan met extra tomaat en komkommer.',
  'Het lekkerst binnen een paar uur gegeten, voordat het brood te zacht wordt.',
  'Rooster het brood vooraf en meng pas vlak voor het eten met de groenten.',
  true
where not exists (select 1 from public.recipes where title = 'Panzanella (Toscaanse broodsalade)');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Pasta met pompoen en salie',
  'Romige pastasaus van geroosterde pompoen, salie en Parmezaanse kaas — verzadigend en vol magnesium.',
  '["350g pasta", "500g pompoen", "verse salie", "2 teentjes knoflook", "scheutje room", "Parmezaanse kaas", "handvol pompoenpitten"]'::jsonb,
  'Rooster de pompoen, pureer met room tot een saus, kook de pasta en meng alles met salie en Parmezaan.',
  35,
  '{"vet": "16g", "eiwit": "16g", "calorieen": 480, "koolhydraten": "64g"}'::jsonb,
  '{"Diner","Pasta","Vegetarisch","Magnesiumrijk"}'::text[],
  NULL,
  4,
  'makkelijk',
  '["Verwarm de oven voor op 200°C en rooster de in blokjes gesneden pompoen 25 minuten.", "Kook de pasta volgens de verpakking.", "Fruit de knoflook en salie kort in boter.", "Pureer de geroosterde pompoen met een scheutje room en het salie-knoflookmengsel tot een gladde saus.", "Meng de saus door de pasta en werk af met Parmezaanse kaas en pompoenpitten."]'::jsonb,
  '["Chilivlokken", "Extra kaas"]'::jsonb,
  'Vervang de pasta door courgettespaghetti voor een flink lagere koolhydraatinname.',
  'Tot 3 dagen in de koelkast.',
  'Rooster en pureer de pompoensaus vooraf, kook de pasta vlak voor het eten.',
  false
where not exists (select 1 from public.recipes where title = 'Pasta met pompoen en salie');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Peruaanse ceviche met zoete aardappel en mais',
  'Rauwe witvis, gegaard in limoensap, met de klassieke Peruaanse bijgerechten zoete aardappel en mais.',
  '["300g verse witvis (bijv. zeebaars)", "6 limoenen", "1/2 rode ui", "verse koriander", "1 rode chilipeper", "1 zoete aardappel", "handvol maiskorrels"]'::jsonb,
  'Snijd de vis in blokjes en laat garen in limoensap, kook de zoete aardappel en mais apart en serveer samen.',
  30,
  '{"vet": "4g", "eiwit": "26g", "calorieen": 300, "koolhydraten": "32g"}'::jsonb,
  '{"Lunch","Diner","Glutenvrij","Lactosevrij","Snel"}'::text[],
  NULL,
  2,
  'gemiddeld',
  '["Snijd de vis in kleine blokjes en leg in een schaal.", "Pers de limoenen erover, voeg fijngesneden rode ui, chilipeper en zout toe.", "Laat 10-15 minuten in de koelkast garen in het limoensap.", "Kook ondertussen de zoete aardappel en mais gaar.", "Werk de ceviche af met verse koriander en serveer met de zoete aardappel en mais erbij."]'::jsonb,
  '["Extra chilipeper", "Sla als bedje"]'::jsonb,
  'Laat de zoete aardappel weg en serveer alleen met extra sla en mais.',
  'Ceviche is het lekkerst vers en dezelfde dag gegeten.',
  'Snijd de vis en kook de zoete aardappel vooraf, laat de vis pas op het laatste moment garen in het limoensap.',
  false
where not exists (select 1 from public.recipes where title = 'Peruaanse ceviche met zoete aardappel en mais');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Pindakaas-havermout cookies (no-bake)',
  'Snelle, geen-oven-nodig koekjes van havermout, pindakaas en honing — een stevige, voedzame snack.',
  '["150g havermout", "150g pindakaas", "80g honing", "1 tl vanille-extract"]'::jsonb,
  'Verwarm pindakaas en honing zachtjes, meng met havermout en vanille en vorm koekjes.',
  15,
  '{"vet": "9g", "eiwit": "6g", "calorieen": 180, "koolhydraten": "20g"}'::jsonb,
  '{"Snack","Dessert","Vegetarisch","Magnesiumrijk","Snel","Voorbereiden"}'::text[],
  NULL,
  6,
  'makkelijk',
  '["Verwarm de pindakaas en honing zachtjes in een pannetje tot vloeibaar.", "Roer de vanille erdoor.", "Meng de havermout erdoor tot een plakkerig deeg.", "Vorm koekjes met een lepel op bakpapier.", "Laat minstens 30 minuten opstijven in de koelkast."]'::jsonb,
  '["Pure chocoladestukjes", "Chiazaad"]'::jsonb,
  'Gebruik iets minder honing voor een minder zoete versie.',
  'Tot een week in een afgesloten bakje.',
  'Maak een dubbele batch — deze koekjes zijn ideaal om in te vriezen.',
  true
where not exists (select 1 from public.recipes where title = 'Pindakaas-havermout cookies (no-bake)');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Popcorn met pure chocolade en zeezout',
  'Zelfgemaakte popcorn, versierd met gesmolten pure chocolade en een snufje grof zeezout — een snelle, luchtige snack tegen zoete trek.',
  '["80g popcornmais", "1 el olie", "80g pure chocolade", "grof zeezout"]'::jsonb,
  'Pop de mais in olie, smelt de chocolade au bain-marie en besprenkel over de popcorn met zeezout.',
  15,
  '{"vet": "10g", "eiwit": "3g", "calorieen": 210, "koolhydraten": "26g"}'::jsonb,
  '{"Snack","Veganistisch","Glutenvrij","Lactosevrij","Comfort food","Snel"}'::text[],
  NULL,
  4,
  'makkelijk',
  '["Verhit de olie in een grote pan met deksel en voeg de popcornmais toe.", "Laat op middelhoog vuur poffen tot het poffen bijna stopt, schud de pan af en toe.", "Smelt de pure chocolade au bain-marie.", "Besprenkel de chocolade over de warme popcorn.", "Bestrooi met grof zeezout en laat de chocolade even opstijven."]'::jsonb,
  '["Gedroogd fruit", "Kaneel"]'::jsonb,
  'Gebruik minder chocolade en meer zeezout voor een minder zoete versie.',
  'Tot 2 dagen in een afgesloten bakje, hoewel het krokantst op de dag zelf.',
  'Pop een grote batch mais vooraf en versier met chocolade vlak voor het serveren.',
  true
where not exists (select 1 from public.recipes where title = 'Popcorn met pure chocolade en zeezout');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Portugese gegrilde sardines met paprika',
  'Eenvoudig gegrilde sardines met een frisse paprika-citroengarnering — een Portugese kuststraditie.',
  '["6 verse sardines", "1 rode paprika", "1 citroen", "verse peterselie", "olijfolie", "1 teentje knoflook"]'::jsonb,
  'Gril de sardines kort, rooster de paprika en meng met citroen, knoflook en peterselie als garnering.',
  25,
  '{"vet": "20g", "eiwit": "28g", "calorieen": 320, "koolhydraten": "6g"}'::jsonb,
  '{"Diner","Glutenvrij","Lactosevrij","Eiwitrijk","Antioxidantrijk","Snel"}'::text[],
  NULL,
  2,
  'makkelijk',
  '["Gril of bak de sardines 3-4 minuten per kant tot gaar.", "Rooster de paprika onder de grill tot de schil zwart is, laat afkoelen en pel.", "Snijd de geroosterde paprika in reepjes.", "Meng de paprika met fijngehakte knoflook, peterselie, citroensap en olijfolie.", "Serveer de sardines met de paprikagarnering erover."]'::jsonb,
  '["Grof zeezout", "Geroosterd brood erbij"]'::jsonb,
  'Dit gerecht is van nature al koolhydraatarm.',
  'Het lekkerst vers bereid en direct gegeten.',
  'Rooster de paprika vooraf, de sardines bak je het best vlak voor het eten.',
  false
where not exists (select 1 from public.recipes where title = 'Portugese gegrilde sardines met paprika');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Portugese sopa de grão (kikkererwtensoep met chorizo)',
  'Een stevige Portugese soep van kikkererwten, chorizo en spinazie, op smaak gebracht met paprikapoeder.',
  '["2 blikken kikkererwten", "100g chorizo in plakjes", "1 ui", "2 teentjes knoflook", "1 tl gerookt paprikapoeder", "150g spinazie", "groentebouillon"]'::jsonb,
  'Bak de chorizo kort aan, fruit ui en knoflook, voeg kikkererwten, paprikapoeder en bouillon toe en laat sudderen, werk af met spinazie.',
  35,
  '{"vet": "16g", "eiwit": "18g", "calorieen": 340, "koolhydraten": "32g"}'::jsonb,
  '{"Diner","Soep","Glutenvrij","IJzerrijk","Eiwitrijk"}'::text[],
  NULL,
  4,
  'makkelijk',
  '["Bak de chorizo kort aan zodat het vet vrijkomt en haal uit de pan.", "Fruit de ui en knoflook in het achtergebleven vet.", "Voeg de kikkererwten, gerookt paprikapoeder en bouillon toe.", "Laat 15 minuten sudderen en pureer eventueel de helft glad voor extra binding.", "Roer de spinazie en chorizo erdoor tot de spinazie net geslonken is."]'::jsonb,
  '["Extra chorizo", "Chilivlokken"]'::jsonb,
  'Gebruik iets minder kikkererwten en vul aan met extra spinazie of boerenkool.',
  'Tot 3 dagen in de koelkast.',
  'Maak een dubbele portie — smaakt de volgende dag vaak nog intenser.',
  true
where not exists (select 1 from public.recipes where title = 'Portugese sopa de grão (kikkererwtensoep met chorizo)');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Regenboog Buddha bowl met tahin-dressing',
  'Een kleurrijke bowl vol geroosterde groenten, quinoa en een romige tahin-citroendressing.',
  '["100g quinoa", "1 zoete aardappel", "1 rode kool, gerild", "handvol spinazie", "1 avocado", "3 el tahin", "citroensap"]'::jsonb,
  'Rooster de zoete aardappel, kook de quinoa, meng tahin met citroen en water tot een dressing en verdeel alles over kommen.',
  35,
  '{"vet": "24g", "eiwit": "13g", "calorieen": 460, "koolhydraten": "48g"}'::jsonb,
  '{"Diner","Lunch","Bowl","Veganistisch","Glutenvrij","Antioxidantrijk","Vezelrijk"}'::text[],
  NULL,
  2,
  'makkelijk',
  '["Verwarm de oven voor op 200°C en rooster de in blokjes gesneden zoete aardappel 20 minuten.", "Kook de quinoa volgens de verpakking.", "Rasp of snijd de rode kool fijn.", "Meng de tahin met citroensap en water tot een gladde dressing.", "Verdeel quinoa, zoete aardappel, rode kool, spinazie en avocado over kommen en schenk de dressing erover."]'::jsonb,
  '["Geroosterde kikkererwten", "Pompoenpitten"]'::jsonb,
  'Vervang de zoete aardappel door extra spinazie en avocado voor minder koolhydraten.',
  'Bewaar de onderdelen apart, tot 2 dagen in de koelkast.',
  'Rooster de zoete aardappel en kook de quinoa vooraf, stel de bowl dan snel samen.',
  false
where not exists (select 1 from public.recipes where title = 'Regenboog Buddha bowl met tahin-dressing');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Salade Niçoise',
  'Een klassieke Franse salade met tonijn, boontjes, ei en olijven — fris en eiwitrijk.',
  '["1 blik tonijn op water", "150g sperziebonen", "2 eieren", "handvol cherrytomaatjes", "handvol zwarte olijven", "sla", "olijfolie", "rode wijnazijn"]'::jsonb,
  'Kook de boontjes en eieren, meng met sla, tomaat, olijven en tonijn en besprenkel met een dressing.',
  20,
  '{"vet": "20g", "eiwit": "28g", "calorieen": 340, "koolhydraten": "10g"}'::jsonb,
  '{"Lunch","Salade","Glutenvrij","Eiwitrijk","Snel"}'::text[],
  NULL,
  2,
  'makkelijk',
  '["Kook de sperziebonen 5 minuten beetgaar en spoel koud af.", "Kook de eieren in 8-9 minuten hard en pel ze.", "Verdeel de sla over borden en schik de boontjes, tomaat en olijven erop.", "Voeg de uitgelekte tonijn en de in parten gesneden eieren toe.", "Besprenkel met olijfolie en rode wijnazijn."]'::jsonb,
  '["Ansjovis", "Rode ui", "Gekookte aardappel"]'::jsonb,
  'Deze salade is van nature al koolhydraatarm.',
  'Bewaar de dressing apart, dan blijft de salade tot 1 dag goed.',
  'Kook de eieren en boontjes vooraf voor een salade die in 5 minuten in elkaar staat.',
  false
where not exists (select 1 from public.recipes where title = 'Salade Niçoise');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Som tam (groene papajasalade)',
  'Een pittig-frisse Thaise salade van geraspte groene papaja, limoen, pinda en sperziebonen.',
  '["1 groene (onrijpe) papaja, geraspt", "handvol sperziebonen", "2 tomaten", "2 el pinda, gehakt", "limoensap", "vissaus", "1 el palmsuiker"]'::jsonb,
  'Kneus de sperziebonen en tomaat licht, meng met de geraspte papaja en breng op smaak met limoen, vissaus en palmsuiker.',
  20,
  '{"vet": "6g", "eiwit": "5g", "calorieen": 180, "koolhydraten": "26g"}'::jsonb,
  '{"Lunch","Salade","Veganistisch","Glutenvrij","Snel","Vezelrijk"}'::text[],
  NULL,
  2,
  'makkelijk',
  '["Rasp de groene papaja in dunne reepjes.", "Snijd de sperziebonen in stukken en de tomaat in partjes.", "Kneus de sperziebonen en tomaat licht in een vijzel of met de achterkant van een lepel.", "Meng met de geraspte papaja.", "Breng op smaak met limoensap, vissaus en palmsuiker en werk af met gehakte pinda."]'::jsonb,
  '["Gedroogde garnaaltjes", "Rode chilipeper"]'::jsonb,
  'Gebruik iets minder palmsuiker voor een lagere koolhydraatinname.',
  'Het lekkerst vers, de papaja wordt snel waterig.',
  'Rasp de papaja vooraf en meng de dressing er pas vlak voor het eten doorheen.',
  true
where not exists (select 1 from public.recipes where title = 'Som tam (groene papajasalade)');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Spaanse aardappel-tortilla',
  'De Spaanse tortilla española: een dikke omelet van aardappel en ui, langzaam gegaard in olijfolie.',
  '["600g aardappelen", "2 uien", "6 eieren", "olijfolie"]'::jsonb,
  'Bak de aardappel en ui zachtjes gaar in olijfolie, meng met losgeklopt ei en bak de tortilla aan beide kanten gaar.',
  45,
  '{"vet": "18g", "eiwit": "14g", "calorieen": 340, "koolhydraten": "28g"}'::jsonb,
  '{"Diner","Ovengerecht","Vegetarisch","Glutenvrij","Lactosevrij","Voorbereiden"}'::text[],
  NULL,
  4,
  'gemiddeld',
  '["Snijd de aardappelen en uien in dunne plakjes.", "Bak ze zachtjes in ruim olijfolie tot zacht, ongeveer 20 minuten, niet bruin laten worden.", "Laat uitlekken en meng met de losgeklopte eieren en een snufje zout.", "Bak het mengsel in een scheutje olie op laag vuur tot de onderkant gestold is.", "Keer de tortilla om met behulp van een bord en bak de andere kant nog 5 minuten."]'::jsonb,
  '["Chorizo", "Paprika erbij"]'::jsonb,
  'Gebruik minder aardappel en meer ui en groenten voor minder koolhydraten.',
  'Tot 3 dagen in de koelkast, ook lekker koud.',
  'Deze tortilla is uitstekend een dag van tevoren te maken.',
  true
where not exists (select 1 from public.recipes where title = 'Spaanse aardappel-tortilla');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Stamppot boerenkool met rookworst',
  'Een Nederlandse winterse stamppot van aardappel en boerenkool met rookworst — vertrouwd en verzadigend.',
  '["800g aardappelen", "300g boerenkool", "1 rookworst", "scheutje melk", "klontje boter"]'::jsonb,
  'Kook de aardappelen met de boerenkool gaar, stamp met melk en boter en serveer met de rookworst.',
  35,
  '{"vet": "26g", "eiwit": "18g", "calorieen": 480, "koolhydraten": "46g"}'::jsonb,
  '{"Diner","Magnesiumrijk","Voorbereiden"}'::text[],
  NULL,
  4,
  'makkelijk',
  '["Schil en kook de aardappelen samen met de boerenkool in ongeveer 20 minuten gaar.", "Verwarm de rookworst ondertussen mee in een pan met water.", "Giet de aardappelen en boerenkool af en stamp fijn met een scheutje melk en boter.", "Breng op smaak met peper en zout.", "Serveer met de rookworst in plakjes erbij."]'::jsonb,
  '["Spekjes", "Mosterd erbij"]'::jsonb,
  'Vervang een deel van de aardappel door extra boerenkool voor minder koolhydraten.',
  'Tot 3 dagen in de koelkast, en goed in te vriezen.',
  'Maak een dubbele portie — stamppot is de volgende dag vaak nog lekkerder.',
  true
where not exists (select 1 from public.recipes where title = 'Stamppot boerenkool met rookworst');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Thaise mangosalade met gegrilde garnalen',
  'Een kleurrijke, frisse Thaise salade van rijpe mango, gegrilde garnalen en een pittig-zoete limoendressing.',
  '["200g gepelde garnalen", "1 rijpe mango", "handvol taugé", "verse munt en koriander", "limoensap", "vissaus", "1 rode chilipeper"]'::jsonb,
  'Gril de garnalen kort, snijd de mango in reepjes en meng alles met de kruiden en dressing.',
  20,
  '{"vet": "6g", "eiwit": "24g", "calorieen": 260, "koolhydraten": "24g"}'::jsonb,
  '{"Lunch","Salade","Glutenvrij","Lactosevrij","Snel","Antioxidantrijk"}'::text[],
  NULL,
  2,
  'makkelijk',
  '["Gril of bak de garnalen 2-3 minuten per kant tot roze en gaar.", "Snijd de mango in dunne reepjes.", "Meng mango, taugé, munt en koriander in een schaal.", "Meng limoensap, vissaus en fijngesneden chilipeper tot een dressing.", "Meng de garnalen en dressing door de salade."]'::jsonb,
  '["Geroosterde pinda", "Rode ui"]'::jsonb,
  'Gebruik iets minder mango en vul aan met extra taugé en komkommer.',
  'Het lekkerst vers, de garnalen worden taai bij opwarmen.',
  'Gril de garnalen vooraf en meng de salade pas vlak voor het eten.',
  false
where not exists (select 1 from public.recipes where title = 'Thaise mangosalade met gegrilde garnalen');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Toscaanse witte bonen met salie en tomaat',
  'Fagioli all uccelletto: een eenvoudig Toscaans boerengerecht van witte bonen, salie, knoflook en tomaat.',
  '["2 blikken witte bonen", "4 blaadjes verse salie", "3 teentjes knoflook", "1 blik tomatenblokjes", "olijfolie"]'::jsonb,
  'Fruit knoflook en salie in olijfolie, voeg de bonen en tomaat toe en laat 15 minuten sudderen.',
  25,
  '{"vet": "9g", "eiwit": "14g", "calorieen": 260, "koolhydraten": "30g"}'::jsonb,
  '{"Diner","Bijgerecht","Veganistisch","Glutenvrij","Lactosevrij","IJzerrijk","Voorbereiden"}'::text[],
  NULL,
  3,
  'makkelijk',
  '["Verhit olijfolie en fruit de knoflook en salieblaadjes kort mee tot geurig.", "Voeg de uitgelekte witte bonen toe en schep om.", "Voeg de tomatenblokjes toe en laat 15 minuten zachtjes sudderen.", "Breng op smaak met peper en zout."]'::jsonb,
  '["Chilivlokken", "Vers brood erbij"]'::jsonb,
  'Vul aan met extra spinazie of boerenkool voor volume met minder koolhydraten.',
  'Tot 4 dagen in de koelkast.',
  'Maak een dubbele portie — smaakt uitstekend als basis voor een snelle lunch de volgende dag.',
  true
where not exists (select 1 from public.recipes where title = 'Toscaanse witte bonen met salie en tomaat');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Turkse kabak mücver (courgette-pannenkoekjes)',
  'Krokant gebakken Turkse courgettepannenkoekjes met feta en dille, geserveerd met yoghurtdip.',
  '["2 courgettes", "100g feta", "2 eieren", "4 el bloem", "verse dille", "Griekse yoghurt", "1 teentje knoflook"]'::jsonb,
  'Rasp de courgette en laat uitlekken, meng met feta, ei en bloem en bak kleine pannenkoekjes goudbruin.',
  30,
  '{"vet": "17g", "eiwit": "14g", "calorieen": 280, "koolhydraten": "18g"}'::jsonb,
  '{"Lunch","Snack","Bijgerecht","Vegetarisch","Magnesiumrijk","Snel"}'::text[],
  NULL,
  3,
  'makkelijk',
  '["Rasp de courgette en meng met een snufje zout, laat 10 minuten staan en knijp het vocht eruit.", "Meng de courgette met verkruimelde feta, eieren, bloem en dille tot een beslag.", "Bak kleine pannenkoekjes in een scheutje olie, 2-3 minuten per kant tot goudbruin.", "Meng de yoghurt met knoflook tot een dip.", "Serveer de pannenkoekjes warm met de yoghurtdip."]'::jsonb,
  '["Munt", "Citroen"]'::jsonb,
  'Vervang de bloem door amandelmeel voor een koolhydraatarmere versie.',
  'Tot 2 dagen in de koelkast, opwarmen in de koekenpan voor het krokante effect.',
  'Rasp en laat de courgette vooraf uitlekken, dan is het beslag zo gemaakt.',
  false
where not exists (select 1 from public.recipes where title = 'Turkse kabak mücver (courgette-pannenkoekjes)');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Turkse mercimek çorbası',
  'Een gladde, romige Turkse rodelinzensoep op smaak gebracht met komijn, munt en citroen.',
  '["250g rode linzen", "1 ui", "1 wortel", "1 aardappel", "1 tl komijnpoeder", "citroensap", "gedroogde munt"]'::jsonb,
  'Fruit de ui aan, voeg linzen, wortel, aardappel en water toe en laat garen, pureer glad en werk af met citroen en munt.',
  40,
  '{"vet": "3g", "eiwit": "14g", "calorieen": 250, "koolhydraten": "40g"}'::jsonb,
  '{"Diner","Lunch","Soep","Vegetarisch","Glutenvrij","IJzerrijk"}'::text[],
  NULL,
  4,
  'makkelijk',
  '["Fruit de ui aan in een scheutje olie.", "Voeg de linzen, in stukken gesneden wortel en aardappel toe met ruim water.", "Voeg het komijnpoeder toe en laat 25 minuten sudderen tot alles gaar is.", "Pureer de soep glad met een staafmixer.", "Breng op smaak met citroensap, zout en gedroogde munt."]'::jsonb,
  '["Boter met paprikapoeder als garnering", "Extra citroen"]'::jsonb,
  'Gebruik iets minder aardappel en linzen en vul aan met extra wortel voor minder koolhydraten.',
  'Tot 4 dagen in de koelkast en goed in te vriezen.',
  'Maak een grote pan en vries in porties in.',
  true
where not exists (select 1 from public.recipes where title = 'Turkse mercimek çorbası');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Turkse mezze met gegrilde groenten en granaatappel',
  'Een kleurrijk Turks mezze-bord met gegrilde aubergine, courgette en paprika, afgemaakt met granaatappelpitten.',
  '["1 aubergine", "1 courgette", "1 rode paprika", "handvol granaatappelpitten", "verse munt", "olijfolie", "citroensap"]'::jsonb,
  'Gril de groenten in plakken, schik op een bord en werk af met granaatappelpitten, munt en citroen.',
  25,
  '{"vet": "10g", "eiwit": "4g", "calorieen": 180, "koolhydraten": "18g"}'::jsonb,
  '{"Lunch","Bijgerecht","Veganistisch","Glutenvrij","Antioxidantrijk","Snel"}'::text[],
  NULL,
  3,
  'makkelijk',
  '["Snijd aubergine, courgette en paprika in plakken.", "Gril de groenten in een grillpan of onder de oven tot gaar en licht gekarameliseerd.", "Schik de gegrilde groenten op een schaal.", "Besprenkel met olijfolie en citroensap.", "Werk af met granaatappelpitten en verse munt."]'::jsonb,
  '["Hummus erbij", "Fetakaas"]'::jsonb,
  'Dit gerecht is van nature al koolhydraatarm.',
  'Tot 2 dagen in de koelkast.',
  'Gril een grote hoeveelheid groenten vooraf, ze zijn zowel warm als koud lekker.',
  true
where not exists (select 1 from public.recipes where title = 'Turkse mezze met gegrilde groenten en granaatappel');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Vietnamese pho bo',
  'Een geurige Vietnamese noedelsoep met rundvlees, steranijs en kaneel, geserveerd met verse kruiden en limoen.',
  '["200g rijstnoedels", "250g dungesneden rundvlees", "1,2L runderbouillon", "1 steranijs", "1 kaneelstokje", "verse gember", "taugé, munt en limoen"]'::jsonb,
  'Trek de bouillon met steranijs, kaneel en gember, kook de noedels, schik het rauwe vlees erop en giet de hete bouillon erover.',
  45,
  '{"vet": "8g", "eiwit": "28g", "calorieen": 420, "koolhydraten": "52g"}'::jsonb,
  '{"Diner","Soep","Glutenvrij","Lactosevrij","IJzerrijk","Eiwitrijk"}'::text[],
  NULL,
  3,
  'gemiddeld',
  '["Breng de bouillon met steranijs, kaneelstokje en in plakjes gesneden gember aan de kook en laat 15 minuten trekken.", "Kook de rijstnoedels volgens de verpakking en verdeel over kommen.", "Leg het dungesneden rauwe rundvlees bovenop de noedels.", "Zeef de hete bouillon en giet deze over het vlees — het vlees gaart hierdoor direct.", "Serveer met taugé, verse munt en limoen erbij."]'::jsonb,
  '["Sriracha", "Hoisinsaus", "Extra verse chili"]'::jsonb,
  'Vervang de rijstnoedels door extra taugé en groenten voor een koolhydraatarme versie.',
  'Bewaar bouillon en noedels apart, tot 3 dagen in de koelkast.',
  'De bouillon is uitstekend een dag van tevoren te trekken en smaakt dan vaak nog voller.',
  false
where not exists (select 1 from public.recipes where title = 'Vietnamese pho bo');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Vietnamese rijstpapierrolletjes met regenboog groenten',
  'Kleurrijke, verse zomerrolletjes gevuld met paprika, wortel, rode kool en munt.',
  '["8 rijstpapiervellen", "1 rode paprika", "1 wortel", "handvol rode kool", "verse munt en koriander", "pindakaas", "sojasaus", "limoen"]'::jsonb,
  'Week de rijstpapiervellen, vul met de gesneden groenten en kruiden, rol op en serveer met pindadipsaus.',
  25,
  '{"vet": "8g", "eiwit": "8g", "calorieen": 240, "koolhydraten": "34g"}'::jsonb,
  '{"Lunch","Snack","Veganistisch","Glutenvrij","Antioxidantrijk"}'::text[],
  NULL,
  2,
  'gemiddeld',
  '["Snijd alle groenten in dunne reepjes.", "Week een rijstpapiervel kort in lauw water tot soepel.", "Beleg met de groenten en verse kruiden.", "Rol strak op zoals een loempia.", "Meng pindakaas, sojasaus, limoensap en wat water tot een dipsaus."]'::jsonb,
  '["Vermicelli", "Tofu in reepjes"]'::jsonb,
  'Vul de rolletjes met extra groenten en minder pindasaus voor minder koolhydraten.',
  'Het lekkerst binnen enkele uren gegeten.',
  'Snijd alle groenten vooraf in reepjes, dan rol je deze in enkele minuten.',
  true
where not exists (select 1 from public.recipes where title = 'Vietnamese rijstpapierrolletjes met regenboog groenten');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Vietnamese zomerrolletjes met garnaal',
  'Frisse, koude rijstpapierrolletjes gevuld met garnalen, verse kruiden en vermicelli, met een pindadipsaus.',
  '["8 rijstpapiervellen", "150g gepelde garnalen", "50g vermicelli rijstnoedels", "sla, munt en koriander", "1 wortel", "pindakaas voor de dipsaus", "sojasaus en limoen"]'::jsonb,
  'Week de rijstpapiervellen, vul met noedels, garnalen en kruiden, rol strak op en serveer met pindadipsaus.',
  30,
  '{"vet": "8g", "eiwit": "18g", "calorieen": 280, "koolhydraten": "36g"}'::jsonb,
  '{"Lunch","Snack","Glutenvrij","Lactosevrij","Snel"}'::text[],
  NULL,
  2,
  'gemiddeld',
  '["Kook de vermicelli volgens de verpakking en spoel koud af.", "Week een rijstpapiervel kort in lauw water tot soepel.", "Beleg met sla, munt, koriander, wortel, noedels en garnalen.", "Rol strak op zoals een loempia.", "Meng pindakaas met sojasaus, limoensap en een scheutje water tot een dipsaus."]'::jsonb,
  '["Komkommer in reepjes", "Chilisaus"]'::jsonb,
  'Vul de rolletjes met extra groenten in plaats van vermicelli.',
  'Het lekkerst binnen enkele uren gegeten — rijstpapier wordt taai in de koelkast.',
  'Snijd alle groenten vooraf, dan rol je deze in enkele minuten.',
  false
where not exists (select 1 from public.recipes where title = 'Vietnamese zomerrolletjes met garnaal');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Vlaamse stoofpot met rundvlees en donker bier',
  'Een Belgisch-Vlaamse klassieker: mals rundvlees, langzaam gegaard in donker bier, met mosterd en een vleugje bruine suiker.',
  '["600g runderstoofvlees", "2 uien", "2 el mosterd", "500ml Belgisch bruin bier", "2 sneetjes peperkoek", "1 el bruine suiker", "runderbouillon"]'::jsonb,
  'Braad het vlees aan, fruit de uien, blus af met bier en laat minstens 2 uur zachtjes stoven met peperkoek en mosterd.',
  150,
  '{"vet": "24g", "eiwit": "38g", "calorieen": 480, "koolhydraten": "22g"}'::jsonb,
  '{"Diner","Eiwitrijk","IJzerrijk","Voorbereiden"}'::text[],
  NULL,
  4,
  'gemiddeld',
  '["Braad het rundvlees rondom bruin in een scheutje olie en haal uit de pan.", "Fruit de uien glazig in dezelfde pan.", "Voeg het vlees terug toe en blus af met het bier.", "Voeg bouillon, mosterd, suiker en de peperkoek toe.", "Laat afgedekt 2 tot 2,5 uur zachtjes stoven tot het vlees mals uiteenvalt.", "Breng op smaak met peper en zout."]'::jsonb,
  '["Laurierblad", "Tijm", "Wortel"]'::jsonb,
  'Vervang de peperkoek door een scheutje extra mosterd en wat tomatenpuree voor minder koolhydraten.',
  'Tot 4 dagen in de koelkast, en uitstekend in te vriezen — smaakt de volgende dag vaak nog beter.',
  'Maak een dubbele portie in het weekend en verdeel over bakjes voor meerdere diners.',
  false
where not exists (select 1 from public.recipes where title = 'Vlaamse stoofpot met rundvlees en donker bier');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Warme appel-kaneelcrumble met havermout',
  'Een troostrijke, warme crumble van gestoofde appel met een knapperige laag havermout en kaneel — minder zoet dan een klassiek dessert.',
  '["4 appels", "1 tl kaneel", "100g havermout", "50g boter", "2 el honing", "handvol walnoten"]'::jsonb,
  'Stoof de appel met kaneel, meng havermout met boter tot kruimels en bak de crumble af in de oven.',
  40,
  '{"vet": "14g", "eiwit": "5g", "calorieen": 320, "koolhydraten": "42g"}'::jsonb,
  '{"Dessert","Vegetarisch","Comfort food","Magnesiumrijk","Voorbereiden"}'::text[],
  NULL,
  4,
  'makkelijk',
  '["Verwarm de oven voor op 190°C.", "Snijd de appels in stukken en stoof 5 minuten met kaneel in een pannetje.", "Meng de havermout met gesmolten boter, honing en gehakte walnoten tot kruimels.", "Verdeel de gestoofde appel in een ovenschaal en bedek met de havermoutkruimels.", "Bak 20-25 minuten tot de bovenkant goudbruin en knapperig is."]'::jsonb,
  '["Rozijnen", "Vanille-ijs erbij"]'::jsonb,
  'Gebruik minder honing en meer kaneel voor een minder zoete versie.',
  'Tot 3 dagen in de koelkast, lekker opgewarmd.',
  'Bereid de crumble een dag van tevoren en bak af vlak voor het serveren.',
  true
where not exists (select 1 from public.recipes where title = 'Warme appel-kaneelcrumble met havermout');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Warme chocolademelk met kaneel',
  'Een troostrijke, romige warme chocolademelk van amandelmelk, pure cacao en een vleugje kaneel.',
  '["300ml amandelmelk", "1,5 el pure cacaopoeder", "1 tl honing", "snufje kaneel"]'::jsonb,
  'Verwarm de melk met cacao, honing en kaneel al roerend tot alles is opgelost.',
  8,
  '{"vet": "5g", "eiwit": "3g", "calorieen": 120, "koolhydraten": "16g"}'::jsonb,
  '{"Drankje","Snack","Veganistisch","Glutenvrij","Lactosevrij","Comfort food","Snel"}'::text[],
  NULL,
  1,
  'makkelijk',
  '["Verwarm de amandelmelk zachtjes in een pannetje.", "Voeg de cacaopoeder, honing en kaneel toe.", "Klop goed door met een garde tot alles is opgelost en de melk licht schuimig is.", "Giet in een mok en serveer warm."]'::jsonb,
  '["Mini marshmallows", "Slagroom"]'::jsonb,
  'Gebruik ongezoete amandelmelk en laat de honing weg voor minder koolhydraten.',
  'Het lekkerst direct warm gedronken.',
  'Meng cacao, honing en kaneel vooraf in een potje zodat je het alleen nog met warme melk hoeft te mengen.',
  true
where not exists (select 1 from public.recipes where title = 'Warme chocolademelk met kaneel');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'West-Afrikaanse pindastoof met kip en spinazie',
  'Een romige, kruidige pindastoof (groundnut stew) met kip, tomaat en spinazie, geïnspireerd op West-Afrikaanse keukens.',
  '["4 kipdijfilets", "3 el pindakaas (100% pinda)", "1 blik tomatenblokjes", "1 ui", "2 teentjes knoflook", "150g spinazie", "kippenbouillon"]'::jsonb,
  'Fruit ui en knoflook, bak de kip aan, roer de pindakaas door de tomaat en bouillon en laat sudderen met de kip tot gaar.',
  40,
  '{"vet": "26g", "eiwit": "34g", "calorieen": 420, "koolhydraten": "14g"}'::jsonb,
  '{"Diner","Eiwitrijk","Glutenvrij","Lactosevrij","IJzerrijk"}'::text[],
  NULL,
  4,
  'gemiddeld',
  '["Fruit de ui en knoflook aan in een scheutje olie.", "Bak de kipdijfilets rondom aan.", "Roer de pindakaas los door de tomatenblokjes en bouillon en voeg toe aan de pan.", "Laat 25 minuten zachtjes sudderen tot de kip gaar is en de saus indikt.", "Roer de spinazie erdoor tot deze net geslonken is."]'::jsonb,
  '["Chilipeper", "Verse gember", "Rijst erbij"]'::jsonb,
  'Deze stoof is van nature al koolhydraatarm.',
  'Tot 3 dagen in de koelkast.',
  'Maak de saus vooraf klaar en voeg de kip pas toe bij het opwarmen voor de beste textuur.',
  false
where not exists (select 1 from public.recipes where title = 'West-Afrikaanse pindastoof met kip en spinazie');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Zalm-teriyaki rijstbowl met edamame',
  'Gebakken zalm in een zoethartige teriyakisaus, geserveerd over rijst met edamame en komkommer.',
  '["2 zalmfilets", "200g rijst", "handvol edamame", "1/2 komkommer", "sojasaus", "mirin", "1 el honing", "sesamzaad"]'::jsonb,
  'Bak de zalm en glaceer met teriyakisaus, kook de rijst en verdeel alles met edamame en komkommer over kommen.',
  30,
  '{"vet": "20g", "eiwit": "34g", "calorieen": 540, "koolhydraten": "50g"}'::jsonb,
  '{"Diner","Bowl","Glutenvrij","Eiwitrijk","Magnesiumrijk"}'::text[],
  NULL,
  2,
  'makkelijk',
  '["Kook de rijst volgens de verpakking.", "Kook de edamame kort volgens de verpakking.", "Meng sojasaus, mirin en honing tot een teriyakisaus.", "Bak de zalm op de huidkant tot bijna gaar, giet de saus erbij en laat inkoken tot glanzend.", "Verdeel rijst, edamame, komkommer en de zalm met saus over kommen en werk af met sesamzaad."]'::jsonb,
  '["Avocado", "Nori-reepjes"]'::jsonb,
  'Vervang de helft van de rijst door extra komkommer en edamame.',
  'Tot 2 dagen in de koelkast, bewaar de rijst apart voor de beste textuur.',
  'Kook de rijst en edamame vooraf, bak de zalm vlak voor het eten.',
  false
where not exists (select 1 from public.recipes where title = 'Zalm-teriyaki rijstbowl met edamame');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Zelfgemaakte trailmix met pure chocolade',
  'Een magnesiumrijke mix van noten, gedroogd fruit en pure chocoladestukjes — perfect tegen zoete trek.',
  '["handvol amandelen", "handvol cashewnoten", "handvol gedroogde cranberries zonder toegevoegde suiker", "handvol pure chocoladestukjes (70%)", "handvol pompoenpitten"]'::jsonb,
  'Meng alle ingrediënten in een afgesloten pot.',
  5,
  '{"vet": "15g", "eiwit": "6g", "calorieen": 220, "koolhydraten": "18g"}'::jsonb,
  '{"Snack","Veganistisch","Glutenvrij","Lactosevrij","Magnesiumrijk","Snel","Voorbereiden"}'::text[],
  NULL,
  6,
  'makkelijk',
  '["Meng de noten, gedroogd fruit, chocoladestukjes en pompoenpitten in een kom.", "Verdeel over een afgesloten pot of kleine zakjes voor onderweg."]'::jsonb,
  '["Kokoschips", "Gedroogde abrikoos"]'::jsonb,
  'Verminder het gedroogde fruit en voeg extra noten toe voor minder koolhydraten.',
  'Tot 3 weken in een afgesloten pot op kamertemperatuur.',
  'Verdeel direct in kleine porties zodat je een grijpklare snack voor onderweg hebt.',
  true
where not exists (select 1 from public.recipes where title = 'Zelfgemaakte trailmix met pure chocolade');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Zoete aardappel-zwarte bonen enchiladas',
  'Gevulde tortilla wraps met zoete aardappel en zwarte bonen, afgebakken onder een laag tomatensaus en kaas.',
  '["8 kleine tortillas", "2 zoete aardappelen", "1 blik zwarte bonen", "1 blik tomatenblokjes", "1 tl chilipoeder", "geraspte kaas"]'::jsonb,
  'Rooster de zoete aardappel, meng met bonen en vul de tortillas, rol op, overgiet met tomatensaus en kaas en bak af in de oven.',
  50,
  '{"vet": "14g", "eiwit": "16g", "calorieen": 420, "koolhydraten": "56g"}'::jsonb,
  '{"Diner","Ovengerecht","Vegetarisch","Magnesiumrijk","Vezelrijk","Voorbereiden"}'::text[],
  NULL,
  4,
  'gemiddeld',
  '["Verwarm de oven voor op 200°C en rooster de in blokjes gesneden zoete aardappel 20 minuten.", "Meng de geroosterde zoete aardappel met de zwarte bonen.", "Vul de tortillas met het mengsel en rol ze op in een ovenschaal.", "Pureer de tomatenblokjes met chilipoeder en giet over de wraps.", "Bestrooi met kaas en bak 20 minuten op 190°C tot de kaas gesmolten is."]'::jsonb,
  '["Avocado", "Verse koriander"]'::jsonb,
  'Gebruik minder tortilla en zoete aardappel en vul aan met extra bonen en groenten.',
  'Tot 3 dagen in de koelkast.',
  'Bereid de enchiladas een dag van tevoren voor en bak ze pas af vlak voor het eten.',
  true
where not exists (select 1 from public.recipes where title = 'Zoete aardappel-zwarte bonen enchiladas');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Zweedse gehaktballetjes met aardappelpuree en bosbessen',
  'Klassieke Zweedse köttbullar met romige jus, aardappelpuree en een frisse bosbessencompote.',
  '["400g half-om-half gehakt", "1 ei", "40g paneermeel", "scheutje melk", "500g aardappelen", "scheutje room", "150g bosbessen"]'::jsonb,
  'Meng en rol de gehaktballetjes, bak ze gaar, kook en stamp de aardappelen en stoof de bosbessen kort in met een beetje suiker.',
  40,
  '{"vet": "24g", "eiwit": "28g", "calorieen": 520, "koolhydraten": "46g"}'::jsonb,
  '{"Diner","Eiwitrijk","IJzerrijk"}'::text[],
  NULL,
  3,
  'gemiddeld',
  '["Meng het gehakt met ei, paneermeel en melk en rol er balletjes van.", "Bak de gehaktballetjes rondom bruin en gaar in een scheutje boter.", "Kook de aardappelen gaar en stamp fijn met een scheutje room.", "Stoof de bosbessen 5 minuten met een klein beetje suiker tot een compote.", "Serveer de gehaktballetjes met puree en de bosbessencompote."]'::jsonb,
  '["Augurk erbij", "Verse dille"]'::jsonb,
  'Vervang de aardappelpuree door bloemkoolpuree voor minder koolhydraten.',
  'Tot 3 dagen in de koelkast, en de gehaktballetjes zijn goed in te vriezen.',
  'Rol en bak een dubbele portie gehaktballetjes en vries ze in — ideaal voor een snel diner later.',
  false
where not exists (select 1 from public.recipes where title = 'Zweedse gehaktballetjes met aardappelpuree en bosbessen');


-- Gap-fill expansion batch

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Shakshuka met feta en volkoren brood',
  'Eieren gepocheerd in een kruidige tomatensaus met paprika en feta — een stevig, eiwitrijk ontbijt of lunch.',
  '["1 ui", "1 paprika", "400g tomatenblokjes", "4 eieren", "100g feta", "1 tl komijn", "volkoren brood", "olijfolie", "peper en zout"]'::jsonb,
  'Fruit ui en paprika, voeg tomaten en komijn toe, laat indikken, breek eieren erin en bak tot het eiwit gestold is. Serveer met feta en brood.',
  25,
  '{"calorieen": 420, "eiwit": "22g", "koolhydraten": "28g", "vet": "24g"}'::jsonb,
  '{"Ontbijt","Lunch","Vegetarisch","Eiwitrijk"}'::text[],
  NULL,
  2,
  'makkelijk',
  '["Snipper de ui en snijd de paprika in blokjes.", "Fruit ui en paprika aan in olijfolie.", "Voeg tomatenblokjes en komijn toe en laat 10 minuten indikken.", "Maak kuiltjes, breek de eieren erin en bak afgedekt 5-7 minuten.", "Verkruimel feta erover en serveer met geroosterd volkoren brood."]'::jsonb,
  NULL::jsonb,
  'Serveer zonder brood, met extra paprika of avocado.',
  'Saus tot 2 dagen in de koelkast; eieren het liefst vers bakken.',
  'Maak de tomatensaus vooraf; voeg eieren pas toe vlak voor het eten.',
  true
where not exists (select 1 from public.recipes where title = 'Shakshuka met feta en volkoren brood');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Japanse tamago-sando',
  'Zachte Japanse eiersalade op luchtig witbrood — een snelle, eiwitrijke lunchklassieker.',
  '["4 eieren", "3 el Japanse mayonaise (of gewone + scheutje rijstazijn)", "4 sneetjes zacht witbrood", "snufje zout en suiker", "boter"]'::jsonb,
  'Kook eieren hard, prak grof met mayonaise, beleg brood, snijd korsten eraf en diagonale driehoekjes.',
  20,
  '{"calorieen": 380, "eiwit": "18g", "koolhydraten": "32g", "vet": "20g"}'::jsonb,
  '{"Lunch","Snack","Vegetarisch","Eiwitrijk","Snel"}'::text[],
  NULL,
  2,
  'makkelijk',
  '["Kook de eieren 9 minuten hard en spoel koud af.", "Pel en prak grof met mayonaise, zout en een snufje suiker.", "Besmeer het brood licht met boter.", "Beleg, snijd de korsten eraf en snijd diagonaal door."]'::jsonb,
  NULL::jsonb,
  NULL,
  NULL,
  NULL,
  true
where not exists (select 1 from public.recipes where title = 'Japanse tamago-sando');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Turks menemen',
  'Roerei in tomatensaus met paprika en ui — een warm Turks ontbijt vol smaak.',
  '["3 eieren", "2 tomaten", "1 paprika", "1 ui", "olijfolie", "pul biber of chilivlokken", "peper en zout", "vers brood"]'::jsonb,
  'Fruit ui en paprika, voeg tomaten toe, roer eieren erdoor tot net gestold. Serveer met brood.',
  20,
  '{"calorieen": 310, "eiwit": "16g", "koolhydraten": "18g", "vet": "20g"}'::jsonb,
  '{"Ontbijt","Lunch","Vegetarisch","Eiwitrijk","Snel"}'::text[],
  NULL,
  2,
  'makkelijk',
  '["Snipper ui en snijd paprika en tomaten fijn.", "Fruit ui en paprika in olijfolie.", "Voeg tomaten toe en laat 5 minuten sudderen.", "Klop eieren los, giet erbij en roer tot net gestold.", "Werk af met pul biber en serveer met brood."]'::jsonb,
  NULL::jsonb,
  NULL,
  NULL,
  NULL,
  true
where not exists (select 1 from public.recipes where title = 'Turks menemen');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Scandinavische havermoutpap met bosbessen',
  'Romige havermoutpap met bosbessen en een scheutje melk — eenvoudig, vezelrijk ontbijt.',
  '["80g havermout", "250ml (plantaardige) melk", "handvol bosbessen", "1 tl honing", "snufje zout", "handvol amandelen"]'::jsonb,
  'Kook havermout met melk tot romig, top af met bosbessen, honing en amandelen.',
  12,
  '{"calorieen": 360, "eiwit": "12g", "koolhydraten": "52g", "vet": "12g"}'::jsonb,
  '{"Ontbijt","Vegetarisch","Vezelrijk","Snel","Magnesiumrijk"}'::text[],
  NULL,
  1,
  'makkelijk',
  '["Breng melk met een snufje zout aan de kook.", "Voeg havermout toe en kook 5-7 minuten al roerend.", "Schep in een kom.", "Top met bosbessen, honing en amandelen."]'::jsonb,
  NULL::jsonb,
  NULL,
  NULL,
  NULL,
  true
where not exists (select 1 from public.recipes where title = 'Scandinavische havermoutpap met bosbessen');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Chia-pudding met mango en kokos',
  'Romige chia-pudding met tropische mango en kokos — ideaal als ontbijt of snack om voor te bereiden.',
  '["3 el chiazaad", "200ml kokosmelk light", "1 rijpe mango", "1 tl honing of ahornsiroop", "geraspte kokos"]'::jsonb,
  'Meng chia met kokosmelk, laat opstijven in de koelkast, top met mango en kokos.',
  10,
  '{"calorieen": 280, "eiwit": "6g", "koolhydraten": "28g", "vet": "16g"}'::jsonb,
  '{"Ontbijt","Snack","Veganistisch","Glutenvrij","Voorbereiden","Antioxidantrijk"}'::text[],
  NULL,
  2,
  'makkelijk',
  '["Meng chiazaad, kokosmelk en honing in een potje.", "Laat minimaal 2 uur (liefst overnight) in de koelkast opstijven.", "Snijd de mango in blokjes.", "Schep de pudding in kommen en top met mango en geraspte kokos."]'::jsonb,
  NULL::jsonb,
  NULL,
  NULL,
  'Maak 3-4 potjes tegelijk voor meerdere ochtenden.',
  false
where not exists (select 1 from public.recipes where title = 'Chia-pudding met mango en kokos');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Groene smoothie met spinazie, banaan en pindakaas',
  'Een romige, ijzerrijke groene smoothie die ook verzadigt dankzij pindakaas en banaan.',
  '["1 handvol spinazie", "1 banaan", "1 el pindakaas", "250ml plantaardige melk", "1 tl lijnzaad", "ijsblokjes"]'::jsonb,
  'Blend alles tot een gladde smoothie.',
  5,
  '{"calorieen": 320, "eiwit": "12g", "koolhydraten": "38g", "vet": "14g"}'::jsonb,
  '{"Smoothie","Ontbijt","Snack","Veganistisch","IJzerrijk","Snel","Drankje"}'::text[],
  NULL,
  1,
  'makkelijk',
  '["Doe spinazie, banaan, pindakaas, melk en lijnzaad in de blender.", "Voeg een paar ijsblokjes toe.", "Blend tot volledig glad.", "Drink direct."]'::jsonb,
  NULL::jsonb,
  NULL,
  NULL,
  NULL,
  true
where not exists (select 1 from public.recipes where title = 'Groene smoothie met spinazie, banaan en pindakaas');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Bessen-yoghurt smoothie met haver',
  'Frisse smoothie van yoghurt, bessen en haver — ontbijt in een glas, vol eiwit en vezels.',
  '["150g Griekse yoghurt", "handvol gemengde bessen", "2 el havermout", "1 tl honing", "100ml melk", "ijsblokjes"]'::jsonb,
  'Blend tot een dikke, frisse smoothie.',
  5,
  '{"calorieen": 290, "eiwit": "18g", "koolhydraten": "36g", "vet": "8g"}'::jsonb,
  '{"Smoothie","Ontbijt","Snack","Vegetarisch","Eiwitrijk","Snel","Drankje","Antioxidantrijk"}'::text[],
  NULL,
  1,
  'makkelijk',
  '["Doe yoghurt, bessen, havermout, honing en melk in de blender.", "Voeg ijsblokjes toe.", "Blend glad.", "Serveer meteen."]'::jsonb,
  NULL::jsonb,
  NULL,
  NULL,
  NULL,
  true
where not exists (select 1 from public.recipes where title = 'Bessen-yoghurt smoothie met haver');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Pasta e ceci (pasta met kikkererwten)',
  'Een Romeinse klassieker: korte pasta in een romige saus van kikkererwten, knoflook en rozemarijn.',
  '["200g korte pasta", "1 blik kikkererwten", "2 teentjes knoflook", "1 takje rozemarijn", "olijfolie", "chilivlokken", "peper en zout", "citroenschil"]'::jsonb,
  'Fruit knoflook, prak deel kikkererwten, kook pasta erin tot romig. Werk af met olie en citroenschil.',
  30,
  '{"calorieen": 480, "eiwit": "18g", "koolhydraten": "72g", "vet": "12g"}'::jsonb,
  '{"Diner","Lunch","Pasta","Vegetarisch","Veganistisch","Vezelrijk","IJzerrijk"}'::text[],
  NULL,
  2,
  'makkelijk',
  '["Fruit knoflook en rozemarijn in olijfolie.", "Voeg kikkererwten toe; prak de helft grof.", "Voeg een scheut water toe en laat sudderen.", "Kook de pasta al dente en meng door de saus met wat kookvocht.", "Werk af met chili, peper, olie en citroenschil."]'::jsonb,
  NULL::jsonb,
  NULL,
  NULL,
  NULL,
  true
where not exists (select 1 from public.recipes where title = 'Pasta e ceci (pasta met kikkererwten)');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Spaghetti aglio e olio met broccoli',
  'Snelle Italiaanse pasta met knoflook, chiliolie en broccoli — eenvoudig maar vol smaak.',
  '["200g spaghetti", "1 broccoli", "3 teentjes knoflook", "olijfolie", "chilivlokken", "peper en zout", "parmezaan (optioneel)"]'::jsonb,
  'Kook pasta en broccoli, meng met knoflook-chiliolie.',
  20,
  '{"calorieen": 450, "eiwit": "16g", "koolhydraten": "68g", "vet": "14g"}'::jsonb,
  '{"Diner","Lunch","Pasta","Vegetarisch","Snel"}'::text[],
  NULL,
  2,
  'makkelijk',
  '["Kook de spaghetti volgens de verpakking.", "Blancheer broccoliroosjes 3 minuten mee.", "Fruit knoflook en chili in olijfolie zonder te kleuren.", "Meng pasta en broccoli door de olie met wat kookvocht.", "Werk af met peper en eventueel parmezaan."]'::jsonb,
  NULL::jsonb,
  NULL,
  NULL,
  NULL,
  true
where not exists (select 1 from public.recipes where title = 'Spaghetti aglio e olio met broccoli');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Pasta primavera met lentegroenten',
  'Kleurrijke pasta met seizoensgroenten, citroen en olijfolie — licht en antioxidantrijk.',
  '["200g penne", "1 courgette", "1 paprika", "handvol cherrytomaatjes", "olijfolie", "citroen", "basilicum", "peper en zout"]'::jsonb,
  'Bak groenten kort, meng met pasta, citroen en basilicum.',
  25,
  '{"calorieen": 420, "eiwit": "14g", "koolhydraten": "70g", "vet": "10g"}'::jsonb,
  '{"Diner","Lunch","Pasta","Vegetarisch","Veganistisch","Antioxidantrijk","Snel"}'::text[],
  NULL,
  2,
  'makkelijk',
  '["Kook de pasta al dente.", "Snijd groenten in blokjes of reepjes.", "Bak kort in olijfolie tot ze beetgaar zijn.", "Meng met pasta, citroensap en basilicum.", "Breng op smaak met peper en zout."]'::jsonb,
  NULL::jsonb,
  NULL,
  NULL,
  NULL,
  true
where not exists (select 1 from public.recipes where title = 'Pasta primavera met lentegroenten');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'One-pot tomatensoep-pasta',
  'Comfortabele one-pot pasta die kookt in een milde tomatensoep — ideaal bij cravings naar warm en hartig.',
  '["200g korte pasta", "700ml groentebouillon", "400g tomatenblokjes", "1 ui", "2 teentjes knoflook", "1 tl oregano", "olijfolie", "basilicum"]'::jsonb,
  'Fruit ui/knoflook, voeg tomaten, bouillon en pasta toe, kook tot gaar.',
  25,
  '{"calorieen": 360, "eiwit": "12g", "koolhydraten": "64g", "vet": "7g"}'::jsonb,
  '{"Diner","Pasta","Soep","Vegetarisch","Veganistisch","Comfort food","Snel","Voorbereiden"}'::text[],
  NULL,
  3,
  'makkelijk',
  '["Fruit ui en knoflook in olijfolie.", "Voeg tomatenblokjes, oregano en bouillon toe.", "Voeg de pasta toe en kook al roerend 10-12 minuten.", "Proef of de pasta gaar is; voeg eventueel water toe.", "Werk af met verse basilicum."]'::jsonb,
  NULL::jsonb,
  NULL,
  NULL,
  NULL,
  true
where not exists (select 1 from public.recipes where title = 'One-pot tomatensoep-pasta');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Volkoren wrap met kip, avocado en yoghurt-dressing',
  'Stevige wrap met gegrilde kip, avocado en een frisse yoghurtdressing — goed voor lunch of meal prep.',
  '["2 volkoren wraps", "200g kipfilet", "1 avocado", "100g Griekse yoghurt", "1/2 komkommer", "sla", "citroensap", "peper en zout"]'::jsonb,
  'Grill kip, meng dressing, vul wraps met sla, kip en avocado.',
  25,
  '{"calorieen": 480, "eiwit": "36g", "koolhydraten": "38g", "vet": "20g"}'::jsonb,
  '{"Lunch","Diner","Eiwitrijk","Snel","Voorbereiden"}'::text[],
  NULL,
  2,
  'makkelijk',
  '["Kruid en bak de kipfilet gaar; snijd in reepjes.", "Meng yoghurt met citroensap, peper en zout.", "Besmeer wraps met de dressing.", "Beleg met sla, komkommer, kip en avocado.", "Rol stevig op en snijd doormidden."]'::jsonb,
  NULL::jsonb,
  NULL,
  NULL,
  NULL,
  false
where not exists (select 1 from public.recipes where title = 'Volkoren wrap met kip, avocado en yoghurt-dressing');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Hummus-wrap met geroosterde groenten',
  'Vegan wrap gevuld met hummus en geroosterde seizoensgroenten — kleurrijk en vezelrijk.',
  '["2 wraps", "150g hummus", "1 paprika", "1 courgette", "rode ui", "olijfolie", "komijn", "rucola"]'::jsonb,
  'Rooster groenten, besmeer wraps met hummus en rol op.',
  30,
  '{"calorieen": 390, "eiwit": "12g", "koolhydraten": "48g", "vet": "16g"}'::jsonb,
  '{"Lunch","Vegetarisch","Veganistisch","Vezelrijk","Voorbereiden"}'::text[],
  NULL,
  2,
  'makkelijk',
  '["Verwarm de oven op 200°C.", "Snijd groenten, besprenkel met olie en komijn, rooster 20 minuten.", "Besmeer wraps met hummus.", "Verdeel groenten en rucola.", "Rol op en serveer warm of koud."]'::jsonb,
  NULL::jsonb,
  NULL,
  NULL,
  NULL,
  true
where not exists (select 1 from public.recipes where title = 'Hummus-wrap met geroosterde groenten');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Franse ratatouille',
  'Provençaalse groentestoof van aubergine, courgette, paprika en tomaat — veelzijdig als bijgerecht of hoofdgerecht.',
  '["1 aubergine", "1 courgette", "2 paprika''s", "400g tomatenblokjes", "1 ui", "2 teentjes knoflook", "tijm", "olijfolie"]'::jsonb,
  'Bak groenten, stoof met tomaten en tijm tot zacht.',
  45,
  '{"calorieen": 180, "eiwit": "5g", "koolhydraten": "22g", "vet": "8g"}'::jsonb,
  '{"Diner","Bijgerecht","Veganistisch","Glutenvrij","Antioxidantrijk","Voorbereiden"}'::text[],
  NULL,
  4,
  'makkelijk',
  '["Snijd alle groenten in gelijke blokjes.", "Fruit ui en knoflook.", "Voeg aubergine, courgette en paprika toe en bak 10 minuten.", "Voeg tomaten en tijm toe.", "Laat 20-25 minuten sudderen tot alles zacht is."]'::jsonb,
  NULL::jsonb,
  NULL,
  NULL,
  NULL,
  true
where not exists (select 1 from public.recipes where title = 'Franse ratatouille');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Portugese bacalhau à Brás',
  'Klassiek Portugees gerecht van kabeljauw, ui, aardappelreepjes en ei — troostrijk en eiwitrijk.',
  '["300g gedroogde of verse kabeljauw", "2 uien", "300g aardappel (julienne of ovenfriet)", "4 eieren", "olijfolie", "peterselie", "zwarte olijven"]'::jsonb,
  'Bak aardappelreepjes knapperig, fruit ui, meng met kabeljauw en eieren tot romig.',
  40,
  '{"calorieen": 460, "eiwit": "32g", "koolhydraten": "28g", "vet": "24g"}'::jsonb,
  '{"Diner","Eiwitrijk","Glutenvrij","Comfort food"}'::text[],
  NULL,
  3,
  'gemiddeld',
  '["Bak de aardappelreepjes knapperig in de oven of pan.", "Fruit de uien zacht in olijfolie.", "Voeg de kabeljauw toe en verwarm mee.", "Meng aardappel erdoor.", "Roer losgeklopte eieren erdoor tot net gestold; werk af met peterselie en olijven."]'::jsonb,
  NULL::jsonb,
  NULL,
  NULL,
  NULL,
  false
where not exists (select 1 from public.recipes where title = 'Portugese bacalhau à Brás');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Ethiopische misir wot (pittige linzenstoof)',
  'Rode linzen gestoofd met berbere-kruiden en ui — ijzerrijk, vegan en perfect met injera of rijst.',
  '["200g rode linzen", "2 uien", "2 teentjes knoflook", "1 el tomatpuree", "1-2 tl berbere of chilipoeder + komijn", "olijfolie", "500ml water"]'::jsonb,
  'Fruit ui langzaam, voeg kruiden en linzen toe, stoof tot dik en zacht.',
  40,
  '{"calorieen": 300, "eiwit": "18g", "koolhydraten": "42g", "vet": "6g"}'::jsonb,
  '{"Diner","Lunch","Curry","Veganistisch","Glutenvrij","IJzerrijk","Vezelrijk","Voorbereiden"}'::text[],
  NULL,
  4,
  'makkelijk',
  '["Snipper uien fijn en fruit langzaam 10 minuten.", "Voeg knoflook, tomatpuree en berbere toe.", "Voeg linzen en water toe.", "Laat 20-25 minuten sudderen tot dik.", "Serveer met rijst of platbrood."]'::jsonb,
  NULL::jsonb,
  NULL,
  NULL,
  NULL,
  true
where not exists (select 1 from public.recipes where title = 'Ethiopische misir wot (pittige linzenstoof)');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Mexicaanse black bean tacos',
  'Snelle tacos met gekruide zwarte bonen, avocado en salsa — vezelrijk en verzadigend.',
  '["8 kleine tortilla''s", "1 blik zwarte bonen", "1 avocado", "1 tomaat", "1/2 rode ui", "komijn", "paprikapoeder", "limoen", "koriander"]'::jsonb,
  'Bak bonen met kruiden, vul tortilla''s met bonen, avocado en salsa.',
  20,
  '{"calorieen": 440, "eiwit": "16g", "koolhydraten": "58g", "vet": "16g"}'::jsonb,
  '{"Diner","Lunch","Vegetarisch","Veganistisch","Vezelrijk","Snel"}'::text[],
  NULL,
  2,
  'makkelijk',
  '["Bak de zwarte bonen met komijn en paprika 5 minuten.", "Snijd avocado, tomaat en ui voor de salsa.", "Warm de tortilla''s kort op.", "Vul met bonen, avocado en salsa.", "Besprenkel met limoen en koriander."]'::jsonb,
  NULL::jsonb,
  NULL,
  NULL,
  NULL,
  true
where not exists (select 1 from public.recipes where title = 'Mexicaanse black bean tacos');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Japanse misosoep met tofu en wakame',
  'Lichte, warme Japanse soep met miso, tofu en zeewier — snel, troostrijk en mineraalrijk.',
  '["750ml water", "2 el misopasta", "100g zachte tofu", "1 el gedroogde wakame", "2 lente-uitjes", "1 tl sojasaus"]'::jsonb,
  'Week wakame, verwarm water, los miso erin op, voeg tofu toe.',
  15,
  '{"calorieen": 120, "eiwit": "10g", "koolhydraten": "8g", "vet": "5g"}'::jsonb,
  '{"Soep","Lunch","Snack","Veganistisch","Glutenvrij","Snel"}'::text[],
  NULL,
  2,
  'makkelijk',
  '["Week de wakame 5 minuten in wat water.", "Breng water bijna aan de kook.", "Haal van het vuur en los de miso erin op (niet laten koken).", "Voeg tofu, wakame en sojasaus toe.", "Werk af met lente-ui."]'::jsonb,
  NULL::jsonb,
  NULL,
  NULL,
  NULL,
  true
where not exists (select 1 from public.recipes where title = 'Japanse misosoep met tofu en wakame');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Pannenkoeken van banaan en ei',
  'Snelle, glutenvrije pannenkoekjes van alleen banaan en ei — ideaal bij zoete cravings.',
  '["2 rijpe bananen", "3 eieren", "snufje kaneel", "kokosolie of boter", "vers fruit om te serveren"]'::jsonb,
  'Prak banaan met ei, bak kleine pannenkoekjes, serveer met fruit.',
  15,
  '{"calorieen": 280, "eiwit": "14g", "koolhydraten": "32g", "vet": "10g"}'::jsonb,
  '{"Ontbijt","Dessert","Snack","Vegetarisch","Glutenvrij","Snel","Comfort food"}'::text[],
  NULL,
  2,
  'makkelijk',
  '["Prak de bananen grof.", "Klop de eieren erdoor met kaneel.", "Bak kleine pannenkoekjes in een anti-aanbakpan.", "Keer als de onderkant goudbruin is.", "Serveer met vers fruit."]'::jsonb,
  NULL::jsonb,
  NULL,
  NULL,
  NULL,
  true
where not exists (select 1 from public.recipes where title = 'Pannenkoeken van banaan en ei');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Dark chocolate oat cups',
  'Havermoutcups met een laagje pure chocolade — magnesiumrijke snack om voor te bereiden bij PMS-cravings.',
  '["120g havermout", "3 el pindakaas", "2 el honing", "80g pure chocolade", "snufje zout"]'::jsonb,
  'Meng haverbasis, druk in muffinvormpjes, vul met gesmolten chocolade, laat opstijven.',
  20,
  '{"calorieen": 210, "eiwit": "5g", "koolhydraten": "24g", "vet": "11g"}'::jsonb,
  '{"Snack","Dessert","Vegetarisch","Magnesiumrijk","Voorbereiden","Comfort food"}'::text[],
  NULL,
  6,
  'makkelijk',
  '["Meng havermout, pindakaas, honing en zout.", "Verdeel over 6 muffinbakjes en druk een kuiltje.", "Smelt de pure chocolade au bain-marie.", "Vul de kuiltjes met chocolade.", "Laat 1 uur opstijven in de koelkast."]'::jsonb,
  NULL::jsonb,
  NULL,
  NULL,
  'Bewaar tot 5 dagen in de koelkast.',
  true
where not exists (select 1 from public.recipes where title = 'Dark chocolate oat cups');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Romige paddenstoelenrisotto',
  'Italiaanse risotto met paddenstoelen en Parmezaan — comfort food met complexe koolhydraten voor de luteale fase.',
  '["200g risottorijst", "300g gemengde paddenstoelen", "1 ui", "800ml groentebouillon", "olijfolie", "50g Parmezaan", "boter", "peterselie"]'::jsonb,
  'Fruit ui, bak rijst glazig, voeg bouillon lepelsgewijs toe, meng paddenstoelen en kaas erdoor.',
  40,
  '{"calorieen": 480, "eiwit": "14g", "koolhydraten": "68g", "vet": "16g"}'::jsonb,
  '{"Diner","Rijst","Vegetarisch","Comfort food","Magnesiumrijk"}'::text[],
  NULL,
  3,
  'gemiddeld',
  '["Fruit de ui zacht.", "Bak de rijst 1 minuut mee tot glazig.", "Voeg bouillon lepelsgewijs toe, al roerend, ca. 18 minuten.", "Bak paddenstoelen apart bruin.", "Roer paddenstoelen, boter en Parmezaan door de risotto."]'::jsonb,
  NULL::jsonb,
  NULL,
  NULL,
  NULL,
  false
where not exists (select 1 from public.recipes where title = 'Romige paddenstoelenrisotto');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Zoete aardappel-chili sin carne',
  'Pittige, vegetarische chili met zoete aardappel en bonen — meal-prepvriendelijk en vezelrijk.',
  '["1 zoete aardappel", "1 blik kidneybonen", "1 blik tomatenblokjes", "1 ui", "1 tl komijn", "1 tl paprikapoeder", "olijfolie", "koriander"]'::jsonb,
  'Bak ui en zoete aardappel, stoof met tomaten, kruiden en bonen.',
  35,
  '{"calorieen": 320, "eiwit": "14g", "koolhydraten": "48g", "vet": "7g"}'::jsonb,
  '{"Diner","Vegetarisch","Veganistisch","Glutenvrij","Vezelrijk","Voorbereiden","Magnesiumrijk"}'::text[],
  NULL,
  4,
  'makkelijk',
  '["Snijd zoete aardappel in blokjes.", "Fruit ui, voeg zoete aardappel toe.", "Voeg tomaten, komijn en paprika toe.", "Laat 20 minuten sudderen, voeg bonen toe.", "Werk af met koriander."]'::jsonb,
  NULL::jsonb,
  NULL,
  NULL,
  NULL,
  true
where not exists (select 1 from public.recipes where title = 'Zoete aardappel-chili sin carne');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Peruaanse quinoa salade met avocado',
  'Frisse quinoa-salade met avocado, tomaat en limoen — licht, eiwitrijk en antioxidantrijk.',
  '["150g quinoa", "1 avocado", "200g cherrytomaatjes", "1/2 rode ui", "limoen", "olijfolie", "koriander", "peper en zout"]'::jsonb,
  'Kook quinoa, meng met groenten en limoendressing.',
  25,
  '{"calorieen": 420, "eiwit": "12g", "koolhydraten": "48g", "vet": "20g"}'::jsonb,
  '{"Lunch","Salade","Bowl","Veganistisch","Glutenvrij","Eiwitrijk","Antioxidantrijk"}'::text[],
  NULL,
  2,
  'makkelijk',
  '["Kook de quinoa volgens de verpakking en laat afkoelen.", "Snijd avocado, tomaat en ui.", "Maak een dressing van limoen, olie, peper en zout.", "Meng alles voorzichtig.", "Werk af met koriander."]'::jsonb,
  NULL::jsonb,
  NULL,
  NULL,
  NULL,
  true
where not exists (select 1 from public.recipes where title = 'Peruaanse quinoa salade met avocado');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Thaise groene curry met tofu',
  'Romige groene curry met tofu en groenten — plantaardig, geurig en goed voor ovulatie/folliculaire fase.',
  '["200g tofu", "2 el groene currypasta", "400ml kokosmelk", "1 paprika", "handvol snijbonen", "1 courgette", "thaise basilicum", "rijst om te serveren"]'::jsonb,
  'Bak currypasta, voeg kokosmelk en groenten toe, laat sudderen met tofu.',
  30,
  '{"calorieen": 420, "eiwit": "16g", "koolhydraten": "22g", "vet": "30g"}'::jsonb,
  '{"Diner","Curry","Veganistisch","Glutenvrij","Antioxidantrijk"}'::text[],
  NULL,
  3,
  'makkelijk',
  '["Bak de currypasta kort in een scheutje olie.", "Voeg kokosmelk toe en breng aan de kook.", "Voeg groenten en tofu toe.", "Laat 10-12 minuten sudderen.", "Werk af met Thaise basilicum; serveer met rijst."]'::jsonb,
  NULL::jsonb,
  NULL,
  NULL,
  NULL,
  false
where not exists (select 1 from public.recipes where title = 'Thaise groene curry met tofu');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Omelet met spinazie en geitenkaas',
  'Luchtige omelet met spinazie en geitenkaas — snel, ijzerrijk ontbijt of lunch.',
  '["3 eieren", "handvol spinazie", "40g geitenkaas", "boter of olie", "peper en zout"]'::jsonb,
  'Klop eieren, bak omelet, vul met spinazie en geitenkaas.',
  12,
  '{"calorieen": 340, "eiwit": "24g", "koolhydraten": "4g", "vet": "26g"}'::jsonb,
  '{"Ontbijt","Lunch","Vegetarisch","Eiwitrijk","IJzerrijk","Glutenvrij","Snel"}'::text[],
  NULL,
  1,
  'makkelijk',
  '["Klop de eieren los met peper en zout.", "Bak kort de spinazie mee tot geslonken.", "Giet de eieren in de pan.", "Verkruimel geitenkaas erover.", "Vouw de omelet dubbel en serveer."]'::jsonb,
  NULL::jsonb,
  NULL,
  NULL,
  NULL,
  true
where not exists (select 1 from public.recipes where title = 'Omelet met spinazie en geitenkaas');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Boekweitpannenkoekjes met gerookte zalm',
  'Hartige, glutenvrije pannenkoekjes van boekweitmeel met zalm en dille — eiwitrijk en omega-3.',
  '["100g boekweitmeel", "1 ei", "200ml melk", "100g gerookte zalm", "verse dille", "crème fraîche", "peper en zout"]'::jsonb,
  'Bak dunne pannenkoekjes, beleg met zalm, crème fraîche en dille.',
  25,
  '{"calorieen": 420, "eiwit": "24g", "koolhydraten": "36g", "vet": "18g"}'::jsonb,
  '{"Ontbijt","Lunch","Glutenvrij","Eiwitrijk","Antioxidantrijk"}'::text[],
  NULL,
  2,
  'makkelijk',
  '["Meng boekweitmeel, ei, melk, peper en zout tot een glad beslag.", "Bak dunne pannenkoekjes.", "Besmeer met een beetje crème fraîche.", "Beleg met gerookte zalm en dille.", "Serveer warm of op kamertemperatuur."]'::jsonb,
  NULL::jsonb,
  NULL,
  NULL,
  NULL,
  false
where not exists (select 1 from public.recipes where title = 'Boekweitpannenkoekjes met gerookte zalm');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Indonesische nasi goreng met ei',
  'Gebakken rijst met groenten en gebakken ei — snelle, stevige maaltijd met goede restverwerking.',
  '["400g koude gekookte rijst", "2 eieren", "1 ui", "2 teentjes knoflook", "gemengde groenten", "2 el ketjap manis", "1 tl sambal", "lente-ui"]'::jsonb,
  'Bak ui/knoflook, voeg rijst en ketjap toe, bak ei apart en serveer erbovenop.',
  20,
  '{"calorieen": 480, "eiwit": "16g", "koolhydraten": "68g", "vet": "14g"}'::jsonb,
  '{"Diner","Lunch","Rijst","Vegetarisch","Snel","Comfort food","Voorbereiden"}'::text[],
  NULL,
  2,
  'makkelijk',
  '["Fruit ui en knoflook.", "Voeg groenten kort mee.", "Roerbak de koude rijst erdoor.", "Voeg ketjap en sambal toe.", "Bak eieren en leg ze op de nasi; werk af met lente-ui."]'::jsonb,
  NULL::jsonb,
  NULL,
  NULL,
  NULL,
  true
where not exists (select 1 from public.recipes where title = 'Indonesische nasi goreng met ei');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Geroosterde bloemkool-tacos met tahin',
  'Knapperige bloemkoolroosjes in tortilla''s met tahin-limoensaus — vegan en vol smaak.',
  '["1 bloemkool", "8 tortilla''s", "2 el tahin", "1 limoen", "1 tl komijn", "olijfolie", "rode kool", "koriander"]'::jsonb,
  'Rooster bloemkool, maak tahinsaus, vul tortilla''s.',
  35,
  '{"calorieen": 380, "eiwit": "12g", "koolhydraten": "46g", "vet": "16g"}'::jsonb,
  '{"Diner","Lunch","Veganistisch","Vegetarisch","Vezelrijk"}'::text[],
  NULL,
  3,
  'makkelijk',
  '["Verwarm oven op 210°C.", "Meng bloemkoolroosjes met olie en komijn; rooster 25 minuten.", "Klop tahin met limoensap en water tot een saus.", "Warm tortilla''s.", "Vul met bloemkool, rode kool, saus en koriander."]'::jsonb,
  NULL::jsonb,
  NULL,
  NULL,
  NULL,
  true
where not exists (select 1 from public.recipes where title = 'Geroosterde bloemkool-tacos met tahin');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Warm chocolade-havermoutontbijt',
  'Romige havermout met cacao en banaan — voedzame zoete start, fijn bij cravings.',
  '["80g havermout", "250ml melk", "1 el cacao", "1 banaan", "1 tl honing", "snufje zout"]'::jsonb,
  'Kook havermout met melk en cacao, top met banaan.',
  10,
  '{"calorieen": 390, "eiwit": "14g", "koolhydraten": "62g", "vet": "10g"}'::jsonb,
  '{"Ontbijt","Vegetarisch","Magnesiumrijk","Snel","Comfort food"}'::text[],
  NULL,
  1,
  'makkelijk',
  '["Meng havermout, melk, cacao en zout in een pan.", "Kook 5-7 minuten al roerend.", "Schep in een kom.", "Top met plakjes banaan en honing."]'::jsonb,
  NULL::jsonb,
  NULL,
  NULL,
  NULL,
  true
where not exists (select 1 from public.recipes where title = 'Warm chocolade-havermoutontbijt');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Salade Niçoise met tonijn',
  'Franse klassieker met tonijn, ei, sperziebonen en aardappel — eiwitrijke lunchsalade.',
  '["1 blik tonijn in olijfolie", "2 eieren", "200g sperziebonen", "300g krieltjes", "cherrytomaatjes", "olijven", "sla", "mosterd-vinaigrette"]'::jsonb,
  'Kook aardappel, ei en bonen; schik met tonijn en dressing.',
  30,
  '{"calorieen": 460, "eiwit": "32g", "koolhydraten": "28g", "vet": "24g"}'::jsonb,
  '{"Lunch","Salade","Eiwitrijk","Glutenvrij"}'::text[],
  NULL,
  2,
  'makkelijk',
  '["Kook krieltjes gaar.", "Kook eieren 8 minuten hard.", "Blancheer sperziebonen.", "Schik sla, aardappel, bonen, tomaat, ei en tonijn.", "Besprenkel met mosterd-vinaigrette."]'::jsonb,
  NULL::jsonb,
  NULL,
  NULL,
  NULL,
  false
where not exists (select 1 from public.recipes where title = 'Salade Niçoise met tonijn');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Kokos-linzen dhal met spinazie',
  'Milde Indiase dhal van rode linzen met kokosmelk en spinazie — ijzerrijk comfort food.',
  '["200g rode linzen", "400ml kokosmelk light", "1 ui", "2 teentjes knoflook", "1 tl kerriepoeder", "1 tl kurkuma", "handvol spinazie", "olijfolie"]'::jsonb,
  'Fruit aromaten, kook linzen met kokosmelk, roer spinazie erdoor.',
  30,
  '{"calorieen": 340, "eiwit": "16g", "koolhydraten": "38g", "vet": "14g"}'::jsonb,
  '{"Diner","Curry","Veganistisch","Glutenvrij","IJzerrijk","Vezelrijk","Voorbereiden","Comfort food"}'::text[],
  NULL,
  4,
  'makkelijk',
  '["Fruit ui en knoflook.", "Voeg kerrie en kurkuma toe.", "Voeg linzen, kokosmelk en water toe.", "Laat 20 minuten sudderen.", "Roer spinazie erdoor tot geslonken."]'::jsonb,
  NULL::jsonb,
  NULL,
  NULL,
  NULL,
  true
where not exists (select 1 from public.recipes where title = 'Kokos-linzen dhal met spinazie');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Gegrilde halloumi-salade met watermeloen',
  'Zout-zoete salade van halloumi, watermeloen en munt — fris voor ovulatie/folliculaire fase.',
  '["200g halloumi", "300g watermeloen", "handvol munt", "rucola", "olijfolie", "limoen", "peper"]'::jsonb,
  'Grill halloumi, meng met watermeloen, munt en dressing.',
  15,
  '{"calorieen": 380, "eiwit": "20g", "koolhydraten": "18g", "vet": "26g"}'::jsonb,
  '{"Lunch","Salade","Vegetarisch","Glutenvrij","Snel","Antioxidantrijk"}'::text[],
  NULL,
  2,
  'makkelijk',
  '["Snijd halloumi in plakjes en grill goudbruin.", "Snijd watermeloen in blokjes.", "Meng rucola, watermeloen en munt.", "Leg halloumi erop.", "Besprenkel met olie, limoen en peper."]'::jsonb,
  NULL::jsonb,
  NULL,
  NULL,
  NULL,
  false
where not exists (select 1 from public.recipes where title = 'Gegrilde halloumi-salade met watermeloen');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Koude tomatensoep met volkoren croutons',
  'Extra groenterijke koude tomatensoep als lunchbowl, met knapperige croutons.',
  '["6 rijpe tomaten", "1 komkommer", "1 paprika", "1 teentje knoflook", "olijfolie", "sherryazijn", "volkoren brood voor croutons"]'::jsonb,
  'Blend groenten glad, koel, serveer met croutons.',
  20,
  '{"calorieen": 180, "eiwit": "4g", "koolhydraten": "22g", "vet": "8g"}'::jsonb,
  '{"Lunch","Soep","Veganistisch","Snel","Vezelrijk","Antioxidantrijk"}'::text[],
  NULL,
  3,
  'makkelijk',
  '["Snijd groenten grof.", "Blend met knoflook, olie en azijn tot glad.", "Laat minstens 30 minuten koelen.", "Rooster broodblokjes tot croutons.", "Serveer de soep koud met croutons."]'::jsonb,
  NULL::jsonb,
  NULL,
  NULL,
  NULL,
  true
where not exists (select 1 from public.recipes where title = 'Koude tomatensoep met volkoren croutons');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Koreaanse kimchi-jjigae met tofu',
  'Pittige Koreaanse stoofsoep met kimchi en tofu — warm, verzadigend en vol smaak.',
  '["300g zure kimchi", "200g stevige tofu", "1 ui", "2 teentjes knoflook", "1 el gochujang", "500ml groentebouillon", "1 tl sesamolie", "lente-ui"]'::jsonb,
  'Fruit aromaten met kimchi, voeg bouillon en tofu toe, laat sudderen.',
  30,
  '{"calorieen": 240, "eiwit": "14g", "koolhydraten": "18g", "vet": "12g"}'::jsonb,
  '{"Diner","Soep","Veganistisch","Glutenvrij","Comfort food"}'::text[],
  NULL,
  3,
  'makkelijk',
  '["Fruit ui, knoflook en kimchi in sesamolie.", "Voeg gochujang en bouillon toe.", "Laat 10 minuten sudderen.", "Voeg tofublokjes toe en warm 5 minuten mee.", "Werk af met lente-ui."]'::jsonb,
  NULL::jsonb,
  NULL,
  NULL,
  NULL,
  true
where not exists (select 1 from public.recipes where title = 'Koreaanse kimchi-jjigae met tofu');

insert into public.recipes (
  title, description, ingredients, instructions, preparation_time,
  nutrition_information, category, image_url, servings, difficulty, steps,
  optional_ingredients, low_carb_variant, storage_tip, meal_prep_tip, is_budget
)
select
  'Marokkaanse zoete aardappel-kikkererwtenschotel',
  'Geurige ovenschotel met zoete aardappel, kikkererwten, komijn en kaneel — vezelrijk comfort food.',
  '["2 zoete aardappelen", "1 blik kikkererwten", "1 ui", "1 tl komijn", "1/2 tl kaneel", "olijfolie", "verse koriander", "citroen"]'::jsonb,
  'Rooster zoete aardappel, bak kikkererwten met kruiden, meng en werk af met koriander.',
  40,
  '{"calorieen": 360, "eiwit": "12g", "koolhydraten": "54g", "vet": "10g"}'::jsonb,
  '{"Diner","Ovengerecht","Veganistisch","Glutenvrij","Vezelrijk","IJzerrijk","Voorbereiden"}'::text[],
  NULL,
  3,
  'makkelijk',
  '["Verwarm oven op 200°C en rooster zoete aardappelblokjes 25 minuten.", "Fruit ui met komijn en kaneel.", "Voeg kikkererwten toe en bak 5 minuten mee.", "Meng met de geroosterde zoete aardappel.", "Werk af met koriander en citroensap."]'::jsonb,
  NULL::jsonb,
  NULL,
  NULL,
  NULL,
  true
where not exists (select 1 from public.recipes where title = 'Marokkaanse zoete aardappel-kikkererwtenschotel');
