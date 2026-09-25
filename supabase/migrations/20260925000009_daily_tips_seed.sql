-- Seed the daily knowledge/tips library ("Tip van vandaag").

do $$
begin
  if (select count(*) from public.daily_tips) > 0 then
    return;
  end if;

  insert into public.daily_tips (category, title, short_explanation, practical_example, fun_fact, quiz_question, quiz_options, quiz_answer_explanation) values
  (
    'eiwitten',
    'Waarom zijn eiwitten belangrijk?',
    'Eiwitten zijn de bouwstenen voor je spieren, huid en hormonen. Je lichaam gebruikt ze voortdurend om cellen te herstellen en op te bouwen.',
    'Een eiwitrijke maaltijd is bijvoorbeeld Griekse yoghurt met noten, of gegrilde kip met quinoa.',
    'Wist je dat je lichaam eiwitten niet kan opslaan zoals vet? Daarom is het slim om ze over de dag te verspreiden.',
    'Welk van deze producten bevat relatief veel eiwitten?',
    '[{"label": "Appel", "correct": false}, {"label": "Ei", "correct": true}, {"label": "Komkommer", "correct": false}]',
    'Goed! Een ei bevat ongeveer 6-7 gram eiwit. Eiwitten helpen onder andere bij het onderhouden van spiermassa.'
  ),
  (
    'spiermassa',
    'Wat gebeurt er als je je spieren traint?',
    'Tijdens krachttraining geef je je spieren een prikkel. Pas tijdens rust en herstel bouwen ze zich sterker op dan daarvoor.',
    'Twee tot drie keer per week krachttraining, met voldoende rust ertussen, kan bijdragen aan een actieve leefstijl.',
    'Wist je dat spiermassa belangrijker wordt naarmate we ouder worden, omdat spieren helpen bij kracht, stabiliteit en dagelijks functioneren?',
    'Wanneer wordt een spier eigenlijk sterker?',
    '[{"label": "Tijdens de training zelf", "correct": false}, {"label": "Tijdens rust na de training", "correct": true}, {"label": "Alleen tijdens slaap", "correct": false}]',
    'Klopt! Tijdens de training geef je een prikkel, maar de spier herstelt en versterkt zich vooral in de rust erna.'
  ),
  (
    'vezels',
    'Waarom zijn vezels goed voor je?',
    'Vezels houden je spijsvertering soepel op gang en zorgen voor een geleidelijkere opname van suikers uit je eten.',
    'Volkoren producten, groenten, fruit en peulvruchten zijn allemaal goede vezelbronnen.',
    'Wist je dat vezels ook een rol spelen bij een langer verzadigd gevoel na de maaltijd?',
    'Wat is een goede bron van vezels?',
    '[{"label": "Witte rijst", "correct": false}, {"label": "Linzen", "correct": true}, {"label": "Frisdrank", "correct": false}]',
    'Precies! Peulvruchten zoals linzen zitten boordevol vezels.'
  ),
  (
    'koolhydraten',
    'Zijn koolhydraten nu goed of slecht?',
    'Koolhydraten zijn een belangrijke energiebron voor je lichaam. Het gaat vooral om welke soort en hoeveel je eet, niet om ze volledig te vermijden.',
    'Volkoren varianten en groenten leveren koolhydraten mét vezels, wat je bloedsuiker rustiger houdt dan bijvoorbeeld snoep.',
    'Wist je dat je hersenen glucose (uit koolhydraten) als voorkeursbrandstof gebruiken?',
    'Welke koolhydraatbron houdt je bloedsuiker over het algemeen rustiger?',
    '[{"label": "Witte rijst", "correct": false}, {"label": "Volkoren rijst", "correct": true}, {"label": "Limonade", "correct": false}]',
    'Goed! De vezels in volkoren producten vertragen de opname van suikers in je bloed.'
  ),
  (
    'bloedsuiker',
    'Wat heeft bloedsuiker met je energie te maken?',
    'Als je bloedsuiker snel stijgt en weer daalt, kan dat leiden tot energiedips. Een geleidelijkere stijging geeft vaak stabielere energie.',
    'Combineer koolhydraten met eiwitten of vezels, bijvoorbeeld fruit met een handje noten, voor een rustigere bloedsuikerreactie.',
    'Wist je dat beweging na een maaltijd, zoals een korte wandeling, kan helpen om je bloedsuiker geleidelijker te laten verlopen?',
    NULL, NULL, NULL
  ),
  (
    'insuline',
    'Wat doet insuline eigenlijk?',
    'Insuline is een hormoon dat helpt om suiker uit je bloed naar je cellen te vervoeren, waar het als energie gebruikt kan worden.',
    'Regelmatig bewegen kan bijdragen aan een gevoeligere reactie van je lichaam op insuline.',
    'Wist je dat krachttraining, naast cardio, ook een positieve invloed kan hebben op hoe je lichaam met bloedsuiker omgaat?',
    NULL, NULL, NULL
  ),
  (
    'slaap',
    'Waarom is slaap zo belangrijk voor je hormonen?',
    'Tijdens je slaap herstelt je lichaam en worden veel hormonale processen gereguleerd, waaronder hormonen die met stress en herstel te maken hebben.',
    'Een vast slaapritme, ook in het weekend, kan helpen om je lichaam een stabieler ritme te geven.',
    'Wist je dat de meeste volwassenen baat hebben bij 7-9 uur slaap per nacht?',
    'Wat kan helpen bij een stabieler slaapritme?',
    '[{"label": "Elke dag op een andere tijd naar bed", "correct": false}, {"label": "Een vast slaap- en waaktijdstip aanhouden", "correct": true}, {"label": "Vlak voor het slapen veel cafeïne drinken", "correct": false}]',
    'Klopt! Een vast ritme helpt je interne klok, ook bekend als je bioritme, om zich te stabiliseren.'
  ),
  (
    'stress',
    'Hoe hangen stress en je cyclus samen?',
    'Langdurige stress kan invloed hebben op je hormonale balans. Ontspanningsmomenten kunnen daarom net zo waardevol zijn als beweging of voeding.',
    'Een paar minuten bewuste ademhaling of een korte wandeling kan al helpen om je stressniveau te verlagen.',
    'Wist je dat langzame, diepe ademhaling je zenuwstelsel actief kan helpen kalmeren?',
    NULL, NULL, NULL
  ),
  (
    'beweging',
    'Hoeveel beweging heb je eigenlijk nodig?',
    'Er is geen one-size-fits-all antwoord, maar regelmatige, haalbare beweging — ook in korte sessies — telt mee voor je gezondheid.',
    'Een combinatie van wandelen, kracht en mobiliteit, verspreid over de week, is vaak effectiever dan één keer heel intensief sporten.',
    'Wist je dat zelfs een training van 5-10 minuten al bijdraagt aan je algehele activiteitsniveau?',
    NULL, NULL, NULL
  ),
  (
    'botgezondheid',
    'Wat heeft krachttraining met je botten te maken?',
    'Belasting op je botten, zoals bij krachttraining, kan bijdragen aan het behoud van botdichtheid.',
    'Oefeningen met je eigen lichaamsgewicht, zoals squats, zijn een toegankelijke manier om je botten te belasten.',
    'Wist je dat botdichtheid extra aandacht verdient rondom de overgang, omdat hormonale veranderingen hier invloed op kunnen hebben?',
    'Welk type training kan bijdragen aan het behoud van botdichtheid?',
    '[{"label": "Krachttraining", "correct": true}, {"label": "Alleen stretchen", "correct": false}, {"label": "Stilzitten", "correct": false}]',
    'Precies! Belasting door krachttraining kan bijdragen aan het behoud van je botdichtheid.'
  ),
  (
    'herstel',
    'Waarom zijn rustdagen net zo belangrijk als trainingsdagen?',
    'Tijdens rust herstelt je lichaam van inspanning en bouwt het zich sterker op. Zonder herstel raakt je lichaam eerder vermoeid.',
    'Een rustdag kan actief zijn, bijvoorbeeld een rustige wandeling, of volledig rustig met ontspanning.',
    'Wist je dat herstel een net zo belangrijk onderdeel van een trainingsprogramma is als de training zelf?',
    NULL, NULL, NULL
  ),
  (
    'energie',
    'Waarom voel je je sommige dagen energieker dan andere?',
    'Je energieniveau wordt beïnvloed door onder andere slaap, voeding, stress en hormonale schommelingen.',
    'Luister naar je lichaam: op een dag met weinig energie kan een rustigere training net zo waardevol zijn als een pittige sessie.',
    'Wist je dat het heel normaal is dat je energie van dag tot dag verschilt?',
    NULL, NULL, NULL
  ),
  (
    'hydratatie',
    'Hoeveel water heb je nu eigenlijk echt nodig?',
    'Voldoende hydratatie ondersteunt bijna elk proces in je lichaam, van spijsvertering tot concentratie.',
    'Een handig vuistregel: drink verspreid over de dag, in plaats van in één keer veel water.',
    'Wist je dat ook groenten en fruit bijdragen aan je totale vochtinname?',
    NULL, NULL, NULL
  ),
  (
    'darmgezondheid',
    'Wat heeft je darmgezondheid met de rest van je lichaam te maken?',
    'Je darmen spelen een rol bij de opname van voedingsstoffen en staan in verbinding met je immuunsysteem en zelfs je stemming.',
    'Vezelrijke voeding, zoals groenten, volkoren producten en peulvruchten, ondersteunt een gezonde darmflora.',
    'Wist je dat variatie in je voeding kan bijdragen aan meer diversiteit in je darmflora?',
    NULL, NULL, NULL
  ),
  (
    'cardiovasculaire gezondheid',
    'Waarom is conditie trainen goed voor je hart?',
    'Cardiovasculaire training, zoals wandelen, fietsen of hardlopen, houdt je hart en bloedvaten actief en soepel.',
    'Al 30 minuten matig intensieve beweging per dag, zoals stevig wandelen, ondersteunt je hart- en vaatgezondheid.',
    'Wist je dat je hart ook een spier is, die getraind kan worden net als andere spieren?',
    'Wat is een voorbeeld van cardiovasculaire training?',
    '[{"label": "Stevig wandelen", "correct": true}, {"label": "Stilzitten", "correct": false}, {"label": "Een dutje doen", "correct": false}]',
    'Klopt helemaal! Stevig wandelen verhoogt je hartslag op een toegankelijke manier.'
  ),
  (
    'hormonen',
    'Wat gebeurt er hormonaal rondom de overgang?',
    'Rondom de overgang veranderen de hoeveelheden van hormonen zoals oestrogeen geleidelijk, wat invloed kan hebben op onder andere energie, slaap en stemming.',
    'Een stabiele leefstijl met regelmatige beweging, voldoende eiwitten en goede slaap kan helpen om deze overgang comfortabeler te maken.',
    'Wist je dat elke vrouw de overgang anders ervaart — er is geen "standaard" verloop?',
    NULL, NULL, NULL
  ),
  (
    'vetten',
    'Zijn vetten in voeding slecht voor je?',
    'Vetten zijn juist essentieel: ze zijn nodig voor de aanmaak van hormonen en de opname van bepaalde vitamines.',
    'Onverzadigde vetten uit bijvoorbeeld olijfolie, noten, avocado en vette vis zijn goede keuzes.',
    'Wist je dat je lichaam vetten nodig heeft om hormonen zoals oestrogeen aan te maken?',
    'Welke van deze is een bron van gezonde, onverzadigde vetten?',
    '[{"label": "Avocado", "correct": true}, {"label": "Frisdrank", "correct": false}, {"label": "Witte suiker", "correct": false}]',
    'Precies! Avocado zit vol gezonde onverzadigde vetten.'
  );
end $$;
