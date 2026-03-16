// ================= CONTINENT MAP SYSTEM =================

window.continents = {
  elsera: {
    Dien: [
  { name: "Dien Port", level: "", img: "Maps/Dien/Dient Port.png" },
  { name: "Northern Dien", level: "Lv. 1-9", img: "Maps/Dien/Nothern Dien.png" },
  { name: "Gray Ruins", level: "Lv. 11-19", img: "Maps/Dien/Gray Ruins.png" },
  { name: "Corrupted Basin", level: "Lv. 20-30", img: "Maps/Dien/Corrupted Basin.png" },
  { name: "Secret Laboratory", level: "Lv. 32-55", img: "Maps/Dien/Secret Laboratory.png" }
],


    Lindris: [
      { name: "Lindris", level: "", img: "Maps/Lindris/Lindris.png" },
      { name: "Crescent Lake", level: "Lv. 37-41", img: "Maps/Lindris/Cresendent Lake.png" },
      { name: "Twilight Hill", level: "Lv. 43-48", img: "Maps/Lindris/Twilight Hill.png" },
      { name: "Volcano Dracas", level: "Lv.105-115", img: "Maps/Lindris/Volcano Dracas.png" },
    ],

    Ulan: [
      { name: "Ulan", level: "", img: "Maps/Ulan/Ulan .png" },
      { name: "Ulan Canyon", level: "Lv. 50-56", img: "Maps/Ulan/Ulan Canyon.png" },
      { name: "Protector's Ruins", level: "Lv. 55-59", img: "Maps/Ulan/Protector's Ruins.png" },
      { name: "Desert of the Screaming", level: "Lv. 62-68", img: "Maps/Ulan/Desert of the Screaming.png" },
      { name: "Lower Tomb of Tyriosa 1F", level: "Lv. 65-70", img: "Maps/Ulan/Lower Tomb of Tyriosa 1F.png" },
      { name: "Lower Tomb of Tyriosa 2F", level: "Lv. 74-82", img: "Maps/Ulan/Lower Tomb of Tyriosa 2F.png" },
      { name: "Lower Tomb of Tyriosa 3F", level: "Lv. 88-102", img: "Maps/Ulan/Lower Tomb of Tyriosa 3F.png" }
    ],

    Serbis: [
      { name: "Serbis", level: "", img: "Maps/Serbis/Serbis.png" },
      { name: "Land of Glory", level: "Lv. 70-78", img: "Maps/Serbis/Land of Glory.png" },
      { name: "Battlefield of Templar", level: "Lv. 76-88", img: "Maps/Serbis/Battlefield of Templar.png" },
      { name: "Plateau of Revolution", level: "Lv. 85-94", img: "Maps/Serbis/Plateau of Revolution.png" },
      { name: "Ruins of the War", level: "Lv. 91-100", img: "Maps/Serbis/Ruins of the War.png" },
      { name: "Silvergrass Field", level: "Lv. 101-108", img: "Maps/Serbis/Silvergrass Field.png" },
      { name: "Barbas", level: "Lv. 105-115", img: "Maps/Serbis/Barbas.png" },
      { name: "Deadman's Land District 1", level: "Lv. 87-92", img: "Maps/Serbis/Deadman's Land District 1.png" },
      { name: "Deadman's Land District 2", level: "Lv. 95-100", img: "Maps/Serbis/Deadman's Land District 2.png" },
      { name: "Deadman's Land District 3", level: "Lv. 105-113", img: "Maps/Serbis/Deadman's Land District 3.png" }
]

  },

  kransia: {
  "Ashen Haven": [
    { 
      name: "Ashen Haven",
      level: "",
      img: "Maps/Kransia/Ashen Haven.png"

      
    },

     { 
      name: "Fallen Wasteland",
      level: "",
      img: "Maps/Kransia/Fallen Wasteland.png"
    }
  ],

  
}

};

// ===== MAP BOSS LOCATIONS =====
const mapBossData = {

    "Maps/Dien/Dient Port.png": [
      { name: "Dien Port Plaza", type: "portal", x: 763, y: 474 }
    ],

    "Maps/Dien/Corrupted Basin.png": [
      { name: "Venatus", x: 939, y: 428 },
      { name: "Clemantis", x: 636, y: 111 },

        //  Portals teshi
        { name: "Fetid Puddle", type: "portal", x: 702, y: 455 },
        { name: "In Front of Secret Laboratory", type: "portal", x: 602, y: 227 },
        { name: "Reeking Land", type: "portal", x: 647, y: 728 },

      
        { name: "Secret Laboratory", type: "dungeon", level: "Lv. 32-55",x: 612, y: 156},


        //  Elites teshi
        { name: "Corrupted ShellBug", type: "Unique Monster", level: "Lv. 30", x: 636, y: 566 },
        { name: "Brutal Butcher", type: "Unique Monster", level: "Lv. 35", x: 364, y: 452 }

    ],

    "Maps/Dien/Nothern Dien.png": [

        { name: "Deligeon Ranger Hideout", type: "portal", x: 660, y: 81 },
        { name: "Deligeon Ranger Post 2", type: "portal", x: 604, y: 481 },

        { name: "Outlaw Kaiser", type: "Unique Monster", level: "14", x: 597, y: 310 },
        { name: "Screaming Wings", type: "Unique Monster", level: "Lv. 8", x: 952, y: 422 }

        
    ],

    "Maps/Dien/Gray Ruins.png": [
        { name: "Abandoned Camp", type: "portal", x: 780, y: 383 },
        { name: "Execution Ground", type: "portal", x: 543, y: 476 },
        
        { name: "Dark Apparition", type: "Unique Monster", level: "Lv. 23", x: 445, y: 316 },
        { name: "Suspicious Wizard", type: "Unique Monster", level: "Lv. 19", x: 1008, y: 430 },

    ],

    "Maps/Dien/Secret Laboratory.png": [
        { name: "Undomiel", x: 816, y: 242}, 

        { name: "Magic Puppet", type: "Unique Monster", level: "Lv. 60", x: 890, y: 455 },
        { name: "Wizards Pet", type: "Unique Monster", level: "Lv. 60", x: 789, y: 536 },
        { name: "Secret Creation", type: "Unique Monster", level: "Lv. 40", x: 627, y: 174 }
    ],

    "Maps/Lindris/Lindris.png": [
        { name: "FLoating Tower", type: "portal", x: 422, y: 625 }
    ],

    "Maps/Lindris/Cresendent Lake.png": [
        { name: "Saphirus", x: 693, y: 436 },
        { name: "Viorent", x: 439, y: 340 },

        { name: "Twitching Darkness", type: "portal", x: 506, y: 417 },
        { name: "Silent Moonlight", type: "portal", x: 659, y: 356 },
        { name: "Moonlight Wave", type: "portal", x: 785, y: 569 },

        { name: "Lamia Shaman", type: "Unique Monster", level: "Lv. 46", x: 900, y: 439 },
        { name: "Angusto", type: "Unique Monster", level: "Lv. 46", x: 558, y: 223 },

    ],

    "Maps/Lindris/Twilight Hill.png": [
        { name: "Ratan", x: 873, y: 287 },

        { name: "Lady Dalia", x: 470, y: 277 },
        { name: "Thymele", x: 507, y: 595 },

        { name: "Precarious Transport Route", type: "portal", x: 652, y: 623 },
        { name: "Daybreak Hill", type: "portal", x: 613, y: 399 },
        { name: "Twilight Way", type: "portal", x: 716, y: 214 },

        { name: "Charging Thardus", type: "Unique Monster", level: "Lv. 53", x: 403, y: 528 },
        { name: "Ancient Thardus", type: "Unique Monster", level: "Lv. 49", x: 622, y: 255 },
        { name:  "Berserk Thardus", type: "Unique Monster", level: "Lv. 54", x: 892, y: 497 },
    ],

    "Maps/Lindris/Volcano Dracas.png": [
        { name: "Rakajeth", x: 538, y: 233 }, 
        { name: "Libitina", x: 357, y: 387 },
        
        { name: "Black Field", type: "portal", x: 876, y: 502 },
        { name: "Remains of Arrogance", type: "portal", x: 607, y: 641 },
      
    ],

    "Maps/Ulan/Ulan .png": [
        { name: "Plaza of Liberation", type: "portal", x: 583, y: 460 },  
    ],

    "Maps/Ulan/Ulan Canyon.png": [
        { name: "Ego", x: 319, y: 484 },

        { name: "Rocky Mountain", type: "portal", x: 545, y: 542 },
        { name: "Farmyard", type: "portal", x: 697, y: 288 },
        { name: "Canyon Entrance", type: "portal", x: 837, y: 517 },
        
        { name: "Ancient Turtle", type: "Unique Monster", level: "Lv. 58", x: 769, y: 686 },
        { name: "Desert Golem", type: "Unique Monster", level: "Lv. 57", x: 556, y: 312 },
        { name: "Alarak", type: "Unique Monster", level: "Lv. 49", x: 407, y: 468 },
    ],

     "Maps/Ulan/Protector's Ruins.png": [
        { name: "Parto", x: 652, y: 189 },

        { name: "Livera", x: 764, y: 282 },

        { name: "Acient Traces", type: "portal", x: 383, y: 363 },
        { name: "Nesha's Holy Site", type: "portal", x: 632, y: 443 },
        { name: "Acient Kingdom's Garden", type: "portal", x: 964, y: 427 },

        { name: "Protector of the Ruins", type: "Unique Monster", level: "Lv. 61", x: 396, y: 511 },
        { name: "Black Hand", type: "Unique Monster", level: "Lv. 64", x: 872, y: 410 },
        { name: "Acient Protector", type: "Unique Monster", level: "Lv. 64", x: 726, y: 575 },
    ],

    "Maps/Ulan/Desert of the Screaming.png": [
        { name: "Neutro", x: 564, y: 641 },

        { name: "Travelers's Sanctuary", type: "portal", x: 524, y: 292 },
        { name: "Sand Pit", type: "portal", x: 469, y: 446 },
        { name: "Land of the Haze", type: "portal", x: 746, y: 399 },
        { name: "Tomb of Tyriosa Entrance", type: "portal", x: 608, y: 742 },

        { name: "Tomb of Tyriosa", type: "Dungeon", x: 622, y: 716 },

        { name: "Initikam", type: "Unique Monster", level: "Lv. 71", x: 669, y: 404 },
        { name: "Black Wedge", type: "Unique Monster", level: "Lv. 70", x: 802, y: 577 },
        { name: "Desert Protector", type: "Unique Monster", level: "Lv. 70", x: 898, y: 410 },

    ],

    "Maps/Ulan/Lower Tomb of Tyriosa 1F.png": [
        { name: "Araneo", x: 519, y: 493 },

        { name: "Move to the Lower Tomb of Tyriosa 2F", type: "Dungeon", x: 554, y: 417 },
        { name: "Move to the Lower Tomb of Tyriosa 2F", type: "Dungeon", x: 640, y: 594 },

        { name: "Blood Mother", type: "Unique Monster", level: "Lv. 75", x: 574, y: 254 },
        { name: "Decoy", type: "Unique Monster", level: "Lv. 75", x: 584, y: 526 },
    ],

    "Maps/Ulan/Lower Tomb of Tyriosa 2F.png": [
        { name: "General Aquleus", x: 524, y: 360 },

        { name: "Move to the Lower Tomb of Tyriosa 1F", type: "Dungeon", x: 405, y: 152 },
        { name: "Move to the Lower Tomb of Tyriosa 1F", type: "Dungeon", x: 621, y: 485 },

        { name: "Move to the Lower Tomb of Tyriosa 3F", type: "Dungeon", x: 429, y: 417 },
        { name: "Move to the Lower Tomb of Tyriosa 3F", type: "Dungeon", x: 630, y: 576 },

        { name: "Ghost Webber", type: "Unique Monster", level: "Lv. 87", x: 346, y: 237 },
        { name: "Shadow Webber", type: "Unique Monster", level: "Lv. 87", x: 738, y: 492 },
    ],

    "Maps/Ulan/Lower Tomb of Tyriosa 3F.png": [
        { name: "Milavy", x: 558, y: 400 },

        { name: "Move to the Lower Tomb of Tyriosa 2F", type: "Dungeon", x: 602, y: 157 },
        { name: "Move to the Lower Tomb of Tyriosa 2F", type: "Dungeon", x: 568, y: 618 },

        { name: "Fortuneteller Ariel", type: "Unique Monster", level: "Lv. 103", x: 785, y: 384 },
        { name: "Priest Petroca", type: "Unique Monster", level: "Lv. 103", x: 369, y: 400 },
        { name: "Escort Leader Maximus", type: "Unique Monster", level: "Lv. 103", x: 576, y: 260 },

    ],

    "Maps/Serbis/Serbis.png": [
      { name: "Serbis Plaza", type: "Portal", x: 851, y: 632 },
    ],

    "Maps/Serbis/Land of Glory.png": [
      { name: "Amentis", x: 490, y: 247 },

      { name: "Path to Daybreak", type: "Portal", x: 782, y: 348 },
      { name: "Cracking Rock", type: "Portal", x: 613, y: 442 },
      { name: "Truimphal Road", type: "Portal", x: 737, y: 669 },

      { name: "Sylandra", type: "Unique Monster", level: "Lv. 78", x: 782, y: 398 },
      { name: "Halfmoon Stone Turle", type: "Unique Monster", level: "Lv. 78", x: 525, y: 278 },
      { name: "Cobolt Blitz Captain", type: "Unique Monster", level: "Lv. 83", x: 630, y: 746 },
    ],

    "Maps/Serbis/Battlefield of Templar.png": [
      { name: "Nedra", x: 485, y: 335 },

      { name: "Baron Braudmore", x: 813, y: 304 },
      { name: "Ringor", x: 652, y: 688 },

      { name: "Deadman's Land", type: "Dungeon", x: 664, y: 152 },

      { name: "Dark Orh Watchtower", type: "Portal", x: 968, y: 455 },
      { name: "Deadman's Land Entrance", type: "Portal", x: 715, y: 220 },
      { name: "Serad Crusade Basecamp", type: "Portal", x: 676, y: 411 },
      { name: "Purified Battlefield", type: "Portal", x: 542, y: 518 },

      { name: "Forgotten Olive", type: "Unique Monster", level: "Lv. 87", x: 708, y: 376 },
      { name: "Deadman's Grow", type: "Unique Monster", level: "Lv. 93", x: 556, y: 688 },
      { name: "Black Wings", type: "Unique Monster", level: "Lv. 93", x: 678, y: 788 },
    ],

    "Maps/Serbis/Plateau of Revolution.png": [
      { name: "Wannitas", x: 415, y: 316 },
      { name: "Metus", x: 835, y: 325 },
      { name: "Duplican", x: 606, y: 463 },

      { name: "Ritual Site of Succession", type: "Portal", x: 515, y: 306 },
      { name: "Maigc Stone Ruins", type: "Portal", x: 774, y: 345 },
      { name: "Seat of Gluttony", type: "Portal", x: 480, y: 558 },
      { name: "Trace of Curse", type: "Portal", x: 757, y: 554 },
      { name: "Excavation Camp", type: "Portal", x: 607, y: 760 },

      { name: "Cassandra", type: "Unique Monster", level: "Lv. 92", x: 333, y: 530 },
      { name: "Red Lizardman Patrol Captain", type: "Unique Monster", level: "Lv. 94", x: 618, y: 91 },
      { name: "Mutated Scorpion", type: "Unique Monster", level: "Lv. 97", x: 812, y: 383 },
      { name: "Berserk Higher Harpy", type: "Unique Monster", level: "Lv. 99", x: 851, y: 591 },
    ],

    "Maps/Serbis/Ruins of the War.png": [
      { name: "Shuliar", x: 652, y: 172 },
      { name: "Shuliar", x: 623, y: 783 },

      { name: "Lael's Basecamp", type: "Portal", x: 331, y: 425 },
      { name: "Stronghold of Faith", type: "Portal", x: 577, y: 350 },
      { name: "Shuliar Fort", type: "Portal", x: 731, y: 312 },
      { name: "Great Plains", type: "Portal", x: 508, y: 658 },
      { name: "Renants of Garbana Waterway", type: "Portal", x: 807, y: 630 },

      { name: "Lyrian", type: "Unique Monster", level: "Lv. 98", x: 360, y: 588 },
      { name: "Durian", type: "Unique Monster", level: "Lv. 103", x: 646, y: 331 },
      { name: "Infected kukri", type: "Unique Monster", level: "Lv. 103", x: 809, y: 391 },
      { name: "Straggler Brown", type: "Unique Monster", level: "Lv. 104", x: 908, y: 515 },
    ],

    "Maps/Serbis/Silvergrass Field.png": [
      { name: "Supore", x: 718, y: 424 },
      { name: "Asta", x: 736, y: 587 },
      { name: "Ordo", x: 811, y: 653 },
      { name: "Secreta", x: 925, y: 516 },
      { name: "Chaiflock", x: 953, y: 399 },

      { name: "Traveller's Camp", type: "Portal", x: 548, y: 185 },
      { name: "Next to the River of Giant", type: "Portal", x: 514, y: 427 },
      { name: "Silvergrass Plain", type: "Portal", x: 426, y: 610 },
      { name: "Shadow of Giant", type: "Portal", x: 664, y: 377 },
      { name: "Land of Goldblood Giant", type: "Portal", x: 817, y: 477 },

      { name: "Shaug High-Ranking Wizard", type: "Unique Monster", level: "Lv. 105", x: 601, y: 110 },
      { name: "Shaug Blitz Captain", type: "Unique Monster", level: "Lv. 109", x: 275, y: 488 },
      { name: "Shaug Patrol Captain", type: "Unique Monster", level: "Lv. 110", x: 712, y: 692 },
      { name: "Veridon", type: "Unique Monster", level: "Lv. 113", x: 774, y: 443 },

    ],

    "Maps/Serbis/Barbas.png": [
      { name: "Benji", x: 449, y: 314 },

      { name: "Treasure Hunter Camp", type: "Portal", x: 295, y: 445 },
      { name: "Heart Wet Land", type: "Portal", x: 621, y: 611 },
      { name: "Bone Grave", type: "Portal", x: 704, y: 517 },
      { name: "Dragon Valley Entrance", type: "Portal", x: 860, y: 405 },
      { name: "Dragon Nest", type: "Portal", x: 686, y: 136 },

      { name: "Restrained Soul", type: "Unique Monster", level: "Lv. 112", x: 610, y: 794 },
      { name: "Flame Wolf", type: "Unique Monster", level: "Lv. 114", x: 826, y: 581 },
      { name: "Giant Wyvern", type: "Unique Monster", level: "Lv. 112", x: 537, y: 707 },
      { name: "Red Lizardman Sniper Captain", type: "Unique Monster", level: "Lv. 110", x: 411, y: 628 },
    ],

    "Maps/Serbis/Deadman's Land District 1.png": [
      { name: "Gareth", x: 586, y: 595 },

      { name: "Move to the Deadman's Land District 2", type: "Dungeon", x: 602, y: 291 },

      { name: "Elder Lich", type: "Unique Monster", level: "Lv. 97", x: 661, y: 286 },
      { name: "Catena's Eye", type: "Unique Monster", level: "Lv. 97", x: 665, y: 427 },
      
    ],

    "Maps/Serbis/Deadman's Land District 2.png": [
      { name: "Titore", x: 583, y: 367 },

      { name: "Move to the Deadman's Land District 3", type: "Dungeon", x: 566, y: 609 },
      { name: "Move to the Deadman's Land District 1", type: "Dungeon", x: 655, y: 133 },

      { name: "Elder Scorpious", type: "Unique Monster", level: "Lv. 105", x: 719, y: 488 },
      { name: "Catena's Servant", type: "Unique Monster", level: "Lv. 105", x: 888, y: 455 },
      { name: "Catena's Cry", type: "Unique Monster", level: "Lv. 105", x: 517, y: 556 },
    ],

    "Maps/Serbis/Deadman's Land District 3.png": [
      { name: "Catena", x: 642, y: 386 },

      { name: "Move to the Deadman's Land District 2", type: "Dungeon", x: 413, y: 509 },

      { name: "Catena's Ego", type: "Unique Monster", level: "Lv. 118", x: 373, y: 438 },
      { name: "Catena's Rage", type: "Unique Monster", level: "Lv. 118", x: 714, y: 221 },
      { name: "Catena's Sorrow", type: "Unique Monster", level: "Lv. 118", x: 844, y: 355 },
    ],

};