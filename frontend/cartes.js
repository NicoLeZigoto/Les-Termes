const cartesJSON =[
    // ==========================================
    // TRASH
    // ==========================================
    { category: "TRASH", text: "Qui a le QI le plus proche de la température ambiante (en Celsius) ?", comments:["Il est con ce pd...", "Quand $pseudo compte sur ses doigts il arrive même pas à 10..."] },
    { category: "TRASH", text: "Qui est le plus hypocrite du groupe ?", comments: ["C'est le côté bonne femme de $pseudo qui parle."] },
    { category: "TRASH", text: "Qui a la pire hygiène de vie ?", comments:["$pseudo ! Toi et tes folies !", "$pseudo sent le kebab froid et l'abandon"] },
    { category: "TRASH", text: "Qui a l'humour le plus beauf ?", comments:["Pouet pouet petit blagueur !"] },
    { category: "TRASH", text: "Qui pleure à la moindre critique constructive ?", comments: ["Sors les mouchoirs $pseudo, le monde est méchant."] },
    { category: "TRASH", text: "Qui est le plus gros forceur de la bande ?", comments:["Lâche le steak $pseudo. Vraiment."] },
    { category: "TRASH", text: "Qui ment le plus ?", comments: ["Ça va finir par se voir $pseudo."] },
    { category: "TRASH", text: "Qui ferait la pire baby-sitter ?", comments:["Préparez l'avis de recherches ça ira plus vite."] },
    { category: "TRASH", text: "Qui est le plus lâche face au danger ?", comments: ["Au moins il arrivera rien de grave à $pseudo."] },
    { category: "TRASH", text: "Qui a l'air le plus con sur ses photos ?", comments:["Même Google a refusé de catégoriser $pseudo dans 'humains'"] },
    { category: "TRASH", text: "Qui ferait le pire président ?", comments:["Kim Jong-Un fait moins peur que $pseudo avec du pouvoir"] },
    { category: "TRASH", text: "Qui aurait grandement besoin d'une muselière au vu des atrocités qui sortent de sa bouche au quotidien ?", comments:["Un jour tes mots vont te rattraper $pseudo. Et on verra si tu cours vite..."] },
    { category: "TRASH", text: "Qui aurait collaboré avec la nazis ?", comments:["La loyauté de $pseudo a un prix, et il est étonnamment bas.", "Sérieusement, ne lui racontez JAMAIS de secrets."] },
    { category: "TRASH", text: "Qui lâche les pires « takes » de l'Histoire, tellement controversées qu'on frôle la garde à vue à chaque fin de phrase ?", comments:["« Oh ça va, toute façon on peut plus rien dire... »"] },
    { category: "TRASH", text: "Qui est en train de fusionner physiquement avec sa chaise gamer à force de ne jamais sortir de chez lui ?", comments:["Prendre une douche et aller toucher de l'herbe, c'est pas une quête secondaire $pseudo.", "L'odeur de $pseudo, c'est pour faire des dégâts de zone IRL ?"] },
    { category: "TRASH", text: "Qui est resté mentalement bloqué dans les années 50 vu sa misogynie totalement décomplexée ?", comments:["Pour la millième fois $pseudo, oui les 'bonnes femmes' ont le droit de voter, et non, leur place n'est pas qu'à la cuisine."] },
    { category: "TRASH", text: "Qui est le plus homophobe ?", comments:["La science l'a prouvé : les plus gros homophobes sont juste dans le déni. Assume $pseudo, on t'aimera quand même !", "Ça va finir par pop sur Grindr tout ça..."] },
    { category: "TRASH", text: "Qui est le plus raciste ?", comments:["Le seul 'ami noir' de $pseudo c'est son livreur uber-eat"] },


    // ==========================================
    // SOIREE
    // ==========================================
    { category: "SOIREE", text: "Qui est systématiquement le premier à vomir en soirée ?", comments: ["Quoi ? L'alcool c'est pas cool ?!"] },
    { category: "SOIREE", text: "Qui monopolise toujours la musique pour mettre de la merde ?", comments:["Le compte spotify le moins bien rentabilisé.", "$pseudo met du JUL à 2h du mat et s'étonne qu'on le déteste"] },
    { category: "SOIREE", text: "Qui devient le plus agressif avec 2 grammes dans le sang ?", comments:["Quand $pseudo est bourré il se prend pour McGregor.", "$pseudo s'est même déjà battu avec son ombre"] },
    { category: "SOIREE", text: "Qui s'endort toujours sur le canapé à 23h ?", comments:["12h de sommeil minimum pour $pseudo."] },
    { category: "SOIREE", text: "Qui a les pires anecdotes de soirée alcoolisée ?", comments: ["Pose-toi les bonnes questions $pseudo"] },
    { category: "SOIREE", text: "Qui envoie les pires messages bourrés à son ex ?", comments:["Confisquez-lui son téléphone, la dignité de $pseudo est en danger !"] },
    { category: "SOIREE", text: "Qui essaie de pécho tout ce qui bouge ?", comments:["$pseudo, cette chaudière."] },

    // ==========================================
    // LOVE
    // ==========================================
    { category: "LOVE", text: "Qui est le plus gros canard en couple ?", comments:["Tu demandes la permission pour respirer aussi, $pseudo ?", "$pseudo dit 'comme tu veux chéri' même quand on lui demande s'il va bien"] },
    { category: "LOVE", text: "Qui a les pires goûts en matière d'ex ?", comments:["$pseudo mise sur la quantité plutôt que la qualité...", "Toutes les exs de $pseudo ont leur propre dossier psychiatrique"] },
    { category: "LOVE", text: "Qui pourrait espionner le téléphone de sa moitié pendant son sommeil ?", comments:["Big Brother c'est toi ?", "$pseudo a consulté ses mails et son disque dur externe, mais aussi fouillé son Bluetooth, cliqué sur sa carte mère, démonté sa webcam et est rentré dans son Minitel"] },
    { category: "LOVE", text: "Qui est capable de se remettre avec son ex ?", comments:["En SAH $pseudo faut passer à autre chose."] },
    { category: "LOVE", text: "Qui pleure après l'amour ?", comments:["Au moins c'est pas PENDANT. C'est déjà ça.", "Il chialeeee PUTAIN !!!"] },
    { category: "LOVE", text: "Qui est le roi/la reine des relations toxiques ?", comments: ["Oui $pseudo, c'est TOI le problème."] },
    { category: "LOVE", text: "Qui tombe amoureux(se) en 24h chrono ?", comments: ["$pseudo, cette chaudière..."] },
    { category: "LOVE", text: "Qui se fait toujours friendzoner en beauté ?", comments:["'Non mais $pseudo c'est comme un membre de ma famille quoi'"] },
    { category: "LOVE", text: "Qui fouille dans les DMs de son partenaire H24 ?", comments: ["Tu as un sérieux problème de confiance en toi, $pseudo."] },
    { category: "LOVE", text: "Qui pardonne l'impardonnable par peur d'être seul(e) ?", comments: ["Un peu d'amour propre, $pseudo, merde !"] },
    { category: "LOVE", text: "Qui crée des faux comptes pour stalker ses exs ?", comments:["Le FBI recrute, $pseudo, tente ta chance."] },
    { category: "LOVE", text: "Qui est attiré par des personnes bien trop jeunes ?", comments:["'Non mais dans lore elle a 1000 ans' C'est ça $pseudo?"] },
    { category: "LOVE", text: "Qui pourrait pécho le crush de son pote ?", comments:["Y'a pas d'soucis $pseudo, y'a pas d'soucis..."] },
    { category: "LOVE", text: "Qui semble être le moins hétéro ?", comments: ["Moi ça m'dérange pas $pseudo UwU"] },
    { category: "LOVE", text: "Qui a le plus de chances de finir seul avec un chat ?", comments:["Au moins le chat il peut pas te ghoster $pseudo"] },
    { category: "LOVE", text: "Qui tomberait amoureux d'une IA ?", comments:["$pseudo a déjà dit 'merci' à Siri... Il a dit MERCI !.."] },
    { category: "LOVE", text: "Qui reste ami(e) avec son ex dans l'espoir d'avoir une deuxième chance ?", comments:["J'ai presque de la peine pour toi $pseudo. Presque."] },
    { category: "LOVE", text: "Qui est le moins fidèle en couple ?", comments:["J'ai la solution $pseudo. Il faut que tu te branles énormément."] },
    
    // ==========================================
    // SEXE
    // ==========================================
    { category: "SEXE", text: "Qui fait le plus de bruit au lit ?", comments:["C'est pas une compète $pseudo, t'es pas dans un film de cul.", "Les voisins de $pseudo ont déménagé. Deux fois !"] },
    { category: "SEXE", text: "Qui a les fantasmes les plus bizarres ?", comments:["Le BDSM c'est mignon à côté de ce que regarde $pseudo.", "On a vu l'historique. On a rien dit, mais on a vu..."] },
    { category: "SEXE", text: "Qui a le record de la relation la plus courte chronométrée ?", comments:["Une relation ça dure pas le temps d'un snap $pseudo."] },
    { category: "SEXE", text: "Qui a la plus grosse ?", comments: ["T'as un python dans l'slibard $pseudo.", "Hoooo $pseudo et son colosse !"] },
    { category: "SEXE", text: "Qui baise le moins ?", comments:["Alors $pseudo, t'es plutôt mouchoir ou chaussette ?", "Y'a aucun problème avec ça $pseudo. Gros looser."] },
    { category: "SEXE", text: "Qui a le plus de chances d'avoir un OnlyFans secret ?", comments:["Allez pas voir ça en vaut pas la peine", "Abonnement à 4,99€/mois. $pseudo vaut même pas le prix..."] },
    { category: "SEXE", text: "Qui a forcément menti sur son body-count ?", comments:["$pseudo a la même capote dans son portefeuille depuis 10 ans"] },
    { category: "SEXE", text: "Qui serait le pire coup de sa génération ?", comments:["Avis Google : Déçu de $pseudo, je recommande pas", "$pseudo baise comme il cuisine, et il sait pas faire cuire des pâtes..."] },
    { category: "SEXE", text: "Qui regarde BEAUCOUP TROP de contenus +18 ?", comments: ["Les nichons sont temporaires. Il faut sauver Gotham City !"] },
    { category: "SEXE", text: "Qui est le plus susceptible de cacher un compte Pornhub Premium ici ?", comments:["Everyone Knows That... Ulterior Motives... TELL ME THE TRUUUUTH"] },
    { category: "SEXE", text: "Qui pourait mater sa voisine d'en face au travers de son rideau sans qu'elle le sache ?", comments: ["$pseudo a toujours préféré aux voisins les voisines."] },
    { category: "SEXE", text: "Qui possède un sextoy bien caché pour combler le vide de sa vie sentimentale ?", comments:[ "Appuie là."] },

    // ==========================================
    // ARGENT
    // ==========================================
    { category: "ARGENT", text: "Qui est capable de réclamer un virement Lydia de 50 centimes ?", comments:["SALE JUIF.", "50 centimes par jour ça fait quand même 182,5€ sur 1 an, radin mais malin !"] },
    { category: "ARGENT", text: "Qui pourrait vendre les cadeaux de Noël qu'on lui offre sur Vinted ?", comments:["Cadeau... De Nöel."] },
    { category: "ARGENT", text: "Qui 'oublie' toujours son portefeuille au moment de payer l'addition ?", comments:["L'amnésie sélective de $pseudo frappe encore."] },
    { category: "ARGENT", text: "Qui mourrait sans Fast Food ?", comments: ["Le sang de $pseudo c'est 80% de sauce Big Mac"] },
    { category: "ARGENT", text: "Qui emprunte de l'argent sans jamais rembourser ?", comments: ["Depuis son séjour à Tel-Aviv, $pseudo est un nouvel homme"] },
    { category: "ARGENT", text: "Qui pleure d'être dans le rouge le 8 du mois... pour aller acheter des fringues à 150 balles le 9 ?", comments:["Le banquier de $pseudo est actuellement en réanimation.", "C'est beau le style, au moins tu auras le flow quand tu feras la manche, mon gars."] },
    { category: "ARGENT", text: "Qui possède une collection bien trop importante de figurines, jouets ou peluches, alors qu'il a clairement passé l'âge socialement acceptable ?", comments:["Constate la tristesse de ta jeunesse !", "« ACHÈTE MA MERDE !! »"] },
   
    // ==========================================
    // WTF
    // ==========================================
    { category: "WTF", text: "Qui croit aux théories du complot les plus absurdes ?", comments:["C'est ça, et les pigeons sont des drones du gouvernement $pseudo ?", "Le 11 Septembre est un coup des reptiliens Illuminati de la zone 51"] },
    { category: "WTF", text: "Qui a l'historique internet le plus inavouable ?", comments:["Le FBI a un dossier complet sur toi, $pseudo.", "D'après le testament de $pseudo, il faut supprimer l'historique en priorité", "C'est quoi 'dog destroying twelve femboy with his huge dick and shit everywhere' ? Probablement rien d'extravagant."] },
    { category: "WTF", text: "Qui pourrait devenir un serial killer ?", comments:["Me regarde pas comme ça $pseudo. Tu me fais peur...", "Un quoi ?"] },
    { category: "WTF", text: "Qui se ferait arnaquer par le Prince du Nigéria par mail ?", comments:["Donne-moi ton code de carte bleue $pseudo, je te le garde en sécurité.", "Mais quel abruti, alors que le Nigeria n'existe pas !..", "Pffff alors que tout le monde sait qu'ils n'ont pas internet en Afrique..."] },
    { category: "WTF", text: "Qui pourrait parler à un mur si on ne l'arrête pas ?", comments:["$pseudo a obtenu son diplôme : 'Mashallah tu parles trop'", "Le pire avec $pseudo, c'est que le mur lui répond"] },
    { category: "WTF", text: "Qui pourrait manger de la pâtée pour chat par erreur et trouver ça bon ?", comments: ["'En vrai c'est pas si terrible avec un peu de Ketchup !'"] },
    { category: "WTF", text: "Qui a le plus gros dossier photo compromettant dans les téléphones des autres ?", comments:["Le jour où on te fait chanter, t'es ruiné $pseudo."] },
    { category: "WTF", text: "Qui pourrait rejoindre une secte sans s'en rendre compte ?", comments:["Je vous assure que c'est pour les Resto du Cœur que $pseudo sacrifie des chèvres !"] },
    { category: "WTF", text: "Qui ramène systématiquement la faute sur « les banques », « les médias » ou carrément une communauté précise au 'nez crochu' dès qu'il a un problème dans sa vie ?", comments:["Tu comptes acheter le paradis avec tes banques ?"] },
    { category: "WTF", text: "Qui est de base parti faire ses courses vers 18h un mardi parce qu'il n'avait plus rien dans son frigo à part un demi-citron et un fond de beurre doux, et qu'il voulait absolument acheter des pâtes, genre des tagliatelles ou des linguine vu que les coquillettes ça le fait moins, parce qu'en fait à l'origine il voulait vraiment se faire un gros kiff avec des pâtes au saumon, plutôt du saumon frais d'ailleurs, puisque c'est un plat réconfortant qui lui rappelle grave son enfance, donc par pure nostalgie il voulait se cuisiner ça, puis en fait en marchant jusqu'au Franprix du quartier il n'a pas regardé le sol, il a glissé bêtement sur une plaque d'égout un peu humide à cause de la pluie, il est tombé de tout son long en se cognant méchamment le bras gauche et du coup bah, un attroupement de passants s'est formé pour appeler les secours qui l'ont finalement pris en charge assez rapidement parce que bon, en arrivant aux urgences avec les pompiers le médecin a regardé la radio et a conclu qu'il avait quand même l'épaule complètement déboîtée donc c'est quand même super chaud... mais bon, tout ça pour dire, on s'égare de fou : au final c'est qui ici qui aime les pâtes au saumon ?", comments:["Nan mais là c'est trop trop long...", "STFU!", "Qui a eu l'idée de cette carte de merde sérieux ?" ]},
    // ==========================================
    // QUOTIDIEN
    // ==========================================
    { category: "QUOTIDIEN", text: "Qui est chroniquement en retard, même quand on lui donne une fausse heure ?", comments:["Vous êtes de la famille Delaboca non ?", "Mais si un jour $pseudo arrive à l'heure tu risques d'en entendre parler looongtemps..."] },
    { category: "QUOTIDIEN", text: "Qui annule toujours ses plans à la dernière minute ?", comments:["$pseudo est une personne quantique, c'est un joli terme pour désigner un casse-couilles"] },
    { category: "QUOTIDIEN", text: "Qui passe 8 heures par jour sur TikTok ?", comments:["Brainroted.", "C'est dur d'avoir une conversation avec un mec qui se bave dessus..."] },
    { category: "QUOTIDIEN", text: "Qui laisse traîner sa vaisselle pendant une semaine entière ?", comments:["Si tu laisses traîner assez longtemps elle va peut-être se faire toute seule.", "La vaisselle de $pseudo a développé son propre écosystème, la laver ferait un génocide"] },
    { category: "QUOTIDIEN", text: "Qui pourrait oublier de nourrir son enfant ?", comments:["Qui voudrait un enfant avec $pseudo même ?", "Nourrir son enfant ? Quel enfant ? Oh putain il a un enfant !.."] },
    { category: "QUOTIDIEN", text: "Qui ne répond jamais aux messages ?", comments: ["$pseudo a pas ton temps. Il est busy ok ?"] },
    { category: "QUOTIDIEN", text: "Qui s'énerve tout seul devant les jeux vidéo ?", comments:["T'es pas un Sayan, crier te rend pas plus fort $pseudo.", "Skill issue en vrai..."] },
    { category: "QUOTIDIEN", text: "Qui ment sur la taille de ce qu'il mange quand il est 'au régime' ?", comments: ["$pseudo ? Fit and fun ? J'en doute"] },
    { category: "QUOTIDIEN", text: "Qui conduit comme un psychopathe ?", comments: ["On a tous peur pour notre vie avec toi, $pseudo."] },
    { category: "QUOTIDIEN", text: "Qui est incapable de cuisiner autre chose que des pâtes au beurre ?", comments:["Gordon Ramsay ferait une crise cardiaque avec toi, $pseudo."] },
    { category: "QUOTIDIEN", text: "Qui a la pire vie ?", comments:["Je t'aurais bien fait un câlin mais je fais pas dans la charité"] },
    { category: "QUOTIDIEN", text: "Qui répond 'ça va' alors que clairement ça va pas ?", comments:["Franchement j'aurais pu y croire si y'avait aucune corde autour de ton cou"] },
    { category: "QUOTIDIEN", text: "Qui mérite la palme d'or de la pire fausse excuse éclatée pour ne jamais venir à une de nos soirées ?", comments:["« Désolé j'ai aquaponey », vraiment ? La prochaine fois $pseudo assume juste que tu préfères ta console à notre amitié."] },
    { category: "QUOTIDIEN", text: "Qui ne va JAMAIS se remettre en question même s'il accumule 500 cartes à ce jeu ?", comments:["Regarde-toi un jour dans le miroir $pseudo. Et va lire Toltèque aussi."] },
    { category: "QUOTIDIEN", text: "Qui prend absolument TOUT au premier degré ?", comments:["Il l'a."] },
    { category: "QUOTIDIEN", text: "Qui ne sait jamais s'arrêter et fait systématiquement la vanne de trop qui rend la situation hyper cringe ?", comments:["Essaye de lire l'intéligence emotionelle ", "On riait AVEC toi à la base. Là on a juste honte POUR toi."] },

    // ==========================================
    // EGO
    // ==========================================
    { category: "EGO", text: "Qui s'aime beaucoup trop en regardant son reflet dans les vitrines ?", comments: ["J'y crois pas comment j'suis beau !"] },
    { category: "EGO", text: "Qui ramène systématiquement la conversation à soi ?", comments:["$pseudo a le syndrome du personnage principal.", "Tu parles de ta grand-mère mourante, $pseudo t'explique pourquoi lui il souffre plus que toi"] },
    { category: "EGO", text: "Qui est le plus susceptible de mentir pour impressionner des inconnus ?", comments:["Si $pseudo dit qu'il a pris un jet privé, il était dans le RER B.", "Moi Puceau ? Demande à mes potes si j'suis puceau..."] },
    { category: "EGO", text: "Qui n'avoue jamais qu'il a tort, même face aux preuves ?", comments:["La mauvaise foi a un nom, et c'est $pseudo."] },
    { category: "EGO", text: "Qui est le plus mauvais perdant ?", comments: ["On va finir par cacher le Monopoly à cause de toi, $pseudo.", "$pseudo ne joue qu'aux jeux auquels il est sûr de gagner."] },
    { category: "EGO", text: "Qui fait des vocaux de 4 minutes pour ne rien dire ?", comments: ["On fait tous 'x2' quand tu parles, $pseudo."] },
    { category: "EGO", text: "Qui donne des conseils de vie alors que la sienne est un chaos total ?", comments: ["Gère tes propres problèmes d'abord, $pseudo."] },
    { category: "EGO", text: "Qui veut absolument toujours avoir le dernier mot ?", comments:["Bravo, en votant pour $pseudo vous lui avez encore donné raison..."] },
    { category: "EGO", text: "Qui est le plus stupide ?", comments:["Toi c'est sûr que tu connais le goût des couleurs", "Je crois que $pseudo sait compter jusqu'à Bleu", "Au village des idiots t'es l'idiot du village toi nan ?"] },
    { category: "EGO", text: "Qui sent le plus mauvais ?", comments:["Merde $pseudo une douche c'est pas du luxe, j'ai failli vomir… 2 fois","$pseudo, $pseudo, la crasse sous les néons !"] },
    { category: "EGO", text: "Qui prend le plus de selfies sans jamais les poster ?", comments: ["Le stockage iCloud de $pseudo coûte plus cher que son loyer"] },
    { category: "EGO", text: "Qui se vante d'être un 'go muscu' alors que son abonnement à la salle est le moins bien rentabilisé de l'Histoire ?", comments:["Mon frère ici présent ne va pas souvent à la salle..."] },
    { category: "EGO", text: "Qui corrige toujours ton français comme s'il était prof ?", comments:["On ne dit pas 'fils A pute', bon bah voilà c'est pareil !"] },
    { category: "EGO", text: "Qui est la plus grosse victime ?", comments:["Une fois j'ai vu $pseudo s'excuser auprès du trottoir."] },
    { category: "EGO", text: "Si on lui donnait les pleins pouvoirs mondiaux, qui deviendrait un véritable tyran au bout de deux heures seulement ?", comments:["Donnez du pouvoir à un homme, et vous verrez sa vraie nature se révéler" ] },
    { category: "EGO", text: "Qui se vexe pour tout, extrapole chaque situation, et s'invente des guerres avec des gens qui ne s'intéressent même pas à lui ?", comments:["Tu connais les « 4 Accords Toltèques » $pseudo ?"] },

    // ==========================================
    // STYLE
    // ==========================================
    { category: "STYLE", text: "Qui s'habille mal ?", comments:["Je m'habille mal ?", "$pseudo, tu t'habilles comme si ta mère t'achetait tes fringues... Est-ce que ta mère t'achète tes fringues ?"] },
    { category: "STYLE", text: "Qui achète des vêtements hors de prix pour avoir l'air riche mais c'est raté ?", comments:["Un mec moche en Gucci reste un mec moche. Tu le sais pourtant $pseudo...", "$pseudo claque 300€ dans une veste et tout ça pour que ce soient les SDF qui lui donnent de l'argent..."] },
    { category: "STYLE", text: "Qui a eu la pire coupe de cheveux par le passé ?", comments:["$pseudo. Avoue. Même toi tu trouvais ça horrible.", "Le coiffeur de $pseudo a probablement fait de la prison après ça, du moins on lui souhaite"] },
    { category: "STYLE", text: "Qui a les pires goûts musicaux ?", comments:["$pseudo pisse littéralement dans des violons..."] },
    { category: "STYLE", text: "Qui a le visage le moins beau ?", comments:["$pseudo… un visage que seule une mère peut aimer", "Oh la vache $pseudo t'as mangé un camion avant de venir ?"] },
    { category: "STYLE", text: "Qui a le plus mauvais goût en matière de tatouages ?", comments:["T'inquiète $pseudo, c'est pas comme si c'était pour la vie..."] },

    // ==========================================
    // SURVIE
    // ==========================================
    { category: "SURVIE", text: "Qui mourrait en premier dans une invasion de zombies ?", comments:["Désolé $pseudo, mais même en zombie tu serais pas une menace."] },
    { category: "SURVIE", text: "Qui pourrait manger n'importe quoi du moment que ça se digère ?", comments:["$pseudo mange même des planètes et des émotions", "J'suis dans la cuisine, tu boufferas évidemment c'que j'te prépare"] },
    { category: "SURVIE", text: "Qui est le moins sportif ?", comments:["Non $pseudo, bouger ton gros cul jusqu'au frigo c'est pas du sport…"] },
    { category: "SURVIE", text: "S'il y avait un Battle Royale entre nous là tout de suite, qui se ferait fracasser en premier ?", comments: ["Non $pseudo, être bon aux jeux de combat va pas t'aider ici."] },
    { category: "SURVIE", text: "Qui a le plus de chances de se faire racketter dans une ruelle sombre ?", comments:["Tu veux mourrir ou quoi ?", "J'ai entendu 'Fils de pute va.'"] },
    { category: "SURVIE", text: "En cas de grosse galère en plein milieu de la nuit, qui serait vraiment la DERNIÈRE personne à appeler ?", comments:["« Ah ouais c'est chaud ton truc... Bon, je te laisse, ma game commence. »"] },

    // ==========================================
    // BOULOT
    // ==========================================
    { category: "BOULOT", text: "Qui est le roi pour faire semblant de travailler ?", comments:["Je l'ai vu taffer une fois en 2008. Je crois."] },
    { category: "BOULOT", text: "Qui va se faire virer en premier pour incompétence ?", comments: ["Chômage ! Je suis au chômage !"] },
    { category: "BOULOT", text: "Qui prend 4 pauses clopes d'une heure par jour ?", comments:["Commence jamais cette merde."] },
    { category: "BOULOT", text: "Qui dépense tout son salaire dès le 3 du mois ?", comments: ["Le banquier de $pseudo fait des cauchemars."] },
    { category: "BOULOT", text: "Qui pourrait complètement se la couler douce au chômage ?", comments: ["Fais des gosses $pseudo, ça rapporte gros !"] },
    { category: "BOULOT", text: "Qui enverrait un mail à son boss bourré ?", comments:["Objet : 'AUGMENTATION OU JE ME CASSE'. Envoyé à 2h37, Regretté à 8h00", "Et c'est une fin de carrière pour $pseudo"] }
];


