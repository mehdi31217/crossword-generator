/**
 * Story-mode artwork catalog.
 *
 * Every entry names a real, publicly documented artwork on Wikimedia Commons.
 * `q` holds search queries (first good hit wins), `accept` is a regex the file
 * title must satisfy, `want` boosts titles containing any of these words.
 *
 * Chapter paths here mirror the `image:` fields of data/shahnameh/*.ts.
 */
const BOOKS = {
    rostam_7: { cover: '/images/covers/rostam7.jpg', q: ['Rostam Shahnameh folio', 'Rostam white div'], accept: /rostam|rustam|rakhsh/i, want: ['shahnameh', 'shahnama', 'folio'] },
    rostam_sohrab: { cover: '/images/covers/rostam-sohrab.jpg', q: ['Rostam Sohrab Shahnameh', 'Rustam Suhrab'], accept: /sohrab|suhrab|rostam|rustam/i, want: ['shahnameh', 'folio'] },
    rostam_afrasiab: { cover: '/images/covers/rostam-afrasiab.jpg', q: ['Rostam Afrasiab battle Shahnameh'], accept: /rostam|rustam|afrasiab/i, want: ['shahnameh', 'folio'] },
    siavoshan: { cover: '/images/covers/siavoshan.jpg', q: ['Siyavash fire Shahnameh', 'Siyavush Shahnameh'], accept: /siyav|siyaw|siav/i, want: ['shahnameh', 'folio'] },
    bizhan: { cover: '/images/covers/bizhan.jpg', q: ['Bizhan Manizheh Shahnameh', 'Bijan Manijeh'], accept: /bizhan|bijan|manizh|manije/i, want: ['shahnameh', 'folio'] },
    zal_rudabeh: { cover: '/images/covers/zal-rudabeh.jpg', q: ['Zal Rudabeh Shahnameh', 'Zal Rudaba'], accept: /zal|rudab/i, want: ['shahnameh', 'folio'] },
    farsi_aval: { cover: 'Iranpreschool.jpg', ch: { 5: 'Flag of Iran in Azadi Stadium' } },
    arash: { cover: '/images/covers/arash.jpg', q: ['Arash archer Persian', 'Arash Kamangir'], accept: /arash|archer/i, want: ['persian', 'miniature'] },
    khosrow_shirin: { cover: '/images/covers/khosrow.jpg', q: ['Khusrau Shirin Khamsa Nizami', 'Khosrow Shirin miniature'], accept: /khu?sra?w?|shirin|farhad/i, want: ['khamsa', 'nizami', 'folio'] },
    haft_peykar: { cover: '/images/covers/peykar.jpg', q: ['Haft Paykar Bahram Gur', 'Bahram Gur seven pavilions'], accept: /bahram|haft|paykar|peykar/i, want: ['khamsa', 'nizami', 'folio'] },
    kurosh: { cover: '/images/covers/kurosh.jpg', q: ['Cyrus the Great', 'Cyrus cylinder'], accept: /cyrus|kourosh|kurosh/i, want: ['relief', 'cylinder', 'painting'] },
    zahhak: { cover: '/images/covers/zahhak.jpg', q: ['Zahhak Shahnameh', 'Zahhak serpents'], accept: /zahhak|zohak|faridun|fereydun/i, want: ['shahnameh', 'folio'] },
    kaveh: { cover: '/images/covers/kaveh.jpg', q: ['Kaveh blacksmith Shahnameh', 'Kaveh Derafsh Kaviani'], accept: /kaveh|kavah|faridun|fereydun/i, want: ['shahnameh', 'folio'] },
    esfandiyar: { cover: '/images/covers/esfandiyar.jpg', q: ['Isfandiyar Shahnameh', 'Esfandiyar seven courses'], accept: /isfandiyar|esfandiyar|isfandyar/i, want: ['shahnameh', 'folio'] },
    rostam_esfandiyar: { cover: '/images/covers/rostam-esfandiyar.jpg', q: ['Rostam Isfandiyar combat', 'Rustam Isfandiyar arrow'], accept: /rostam|rustam|isfandiyar|esfandiyar/i, want: ['shahnameh', 'folio'] },
    tahmineh: { cover: '/images/covers/tahmineh.jpg', q: ['Tahmina Rostam', 'Tahminah Shahnameh'], accept: /tahmin/i, want: ['shahnameh', 'folio'] },
    zal_simorgh: { cover: '/images/covers/zal-simorgh.jpg', q: ['Zal Simurgh', 'Simurgh Shahnameh'], accept: /zal|simurgh|simorgh/i, want: ['shahnameh', 'folio'] },
    kaykhosrow: { cover: '/images/covers/kaykhosrow.jpg', q: ['Kay Khosrow Shahnameh', 'Kai Khosrow Afrasiab'], accept: /khosrow|khusraw|kay/i, want: ['shahnameh', 'folio'] },
    rostam_death: { cover: '/images/covers/rostam-death.jpg', q: ['death of Rustam Shahnameh', 'Rostam Shaghad'], accept: /rostam|rustam|rakhsh/i, want: ['shahnameh', 'folio', 'death'] },
    rostam_akvan: { cover: '/images/covers/rostam-akvan.jpg', q: ['Rostam Akvan Div', 'Akvan div Shahnameh'], accept: /rostam|rustam|akvan/i, want: ['shahnameh', 'folio'] },
    hushang: { cover: '/images/covers/hushang.jpg', q: ['Hushang Shahnameh', 'Hushang fire'], accept: /hushang|hushang|hoshang/i, want: ['shahnameh', 'folio'] },
    jamshid: { cover: '/images/covers/jamshid.jpg', q: ['Jamshid Shahnameh', 'Jamshid Persepolis'], accept: /jamshid|jamshid|persepolis/i, want: ['shahnameh', 'folio'] },
    anushirvan: { cover: '/images/covers/anushirvan.jpg', q: ['Khosrow Anushirvan', 'Taq Kasra'], accept: /anushir|anusir|khusrau|khosrow|taq|ctesiphon/i, want: ['painting', 'folio'] },
    mosaddegh: { cover: '/images/covers/mosaddegh.jpg', q: ['Mohammad Mosaddegh', 'Mosaddeq Iran'], accept: /mosadde|mossade|mohammad mosad/i, want: ['portrait', 'trial'] },

    // History campaigns — artefacts, reliefs, monuments and documentary photos.
    medes: { cover: '/images/covers/medes.jpg', q: ['Medes Persepolis relief', 'Ecbatana'], accept: /mede|median|ecbatana|hegmataneh|nineveh|astyag/i, want: ['relief', 'persepolis', 'hamadan'] },
    achaemenids: { cover: '/images/covers/achaemenids.jpg', q: ['Persepolis Apadana', 'Achaemenid'], accept: /apadana|persepolis|achaemen|cyrus|darius|xerxes/i, want: ['relief', 'stairway'] },
    parthians: { cover: '/images/covers/parthians.jpg', q: ['Parthian Shami statue', 'Parthian Empire'], accept: /parthian|parthia|arsacid|shami|carrhae|mithridat/i, want: ['statue', 'relief', 'bronze'] },
    sassanids: { cover: '/images/covers/sassanids.jpg', q: ['Taq Kasra', 'Sasanian Empire'], accept: /sassan|sasanian|taq|ctesiphon|shapur|ardashir/i, want: ['relief', 'arch'] },
    seljuks: { cover: '/images/covers/seljuks.jpg', q: ['Seljuk Empire', 'Sultan Sanjar Mausoleum'], accept: /seljuk|sanjar|tughril|manzikert|nizam al-mulk/i, want: ['mausoleum', 'court'] },
    safavids: { cover: '/images/covers/safavids.jpg', q: ['Shah Abbas I portrait', 'Safavid'], accept: /safavid|abbas|safi al-din|ismail|isfahan|chaldiran/i, want: ['portrait', 'shrine'] },
    qajars: { cover: '/images/covers/qajars.jpg', q: ['Fath Ali Shah Qajar', 'Qajar Iran'], accept: /qajar|fath|ali shah|amir kabir|agha mohammad|ahmad shah|constitution/i, want: ['portrait', 'painting'] },
    hassan_kachal: { cover: '/images/covers/hassan-kachal.jpg', q: ['Persian bathhouse miniature', 'hammam Persian painting'], accept: /hammam|bath|miniature|persian/i, want: ['miniature', 'painting'] },
    farsi_aval: { cover: '/images/covers/farsi-aval.jpg', q: ['Persian school children', 'Iran classroom'], accept: /school|class|student|children/i, want: ['iran', 'persian'] },

    // Chapter lists. `img` is the public path, queries drive the search.
    chapters: {
        rostam_7: [
            { n: 1, q: ['Rakhsh kills a lion Rustam', "Rustam's first course"], accept: /rostam|rustam|rakhsh/i },
            { n: 2, q: ["Rustam's second course", 'Rustam desert thirst'], accept: /rostam|rustam|rakhsh/i },
            { n: 3, q: ['Rustam dragon Shahnameh', "Rustam's third course"], accept: /rostam|rustam|dragon/i },
            { n: 4, q: ["Rustam's fourth course witch", 'Rustam witch'], accept: /rostam|rustam|witch/i },
            { n: 5, q: ['Rustam Awlad Div', 'Rustam captures Awlad'], accept: /rostam|rustam|awlad|avlād/i },
            { n: 6, q: ['Rustam Arzhang Div', "Rustam's sixth course"], accept: /rostam|rustam|arzhang/i },
            { n: 7, q: ["Rustam's seventh course White Div", 'Rustam White Div'], accept: /rostam|rustam|white div/i },
        ],
        rostam_sohrab: [
            { n: 1, q: ['Rostam hunting Shahnameh', 'Rustam onager hunt'], accept: /rostam|rustam|hunt/i },
            { n: 2, q: ['Samangan Shahnameh', 'Rostam Tahmina castle'], accept: /samangan|tahmin|rostam|rustam/i },
            { n: 3, q: ['Rostam and Tahmina', 'Tahmina Shahnameh'], accept: /tahmin/i },
            { n: 4, q: ['birth of Sohrab', 'Sohrab child Shahnameh'], accept: /sohrab|suhrab/i },
            { n: 5, q: ['Sohrab fortress Shahnameh', 'Sohrab white castle'], accept: /sohrab|suhrab/i },
            { n: 6, q: ['Rostam and Sohrab combat', 'Rustam Suhrab battle'], accept: /sohrab|suhrab|rostam|rustam/i },
            { n: 7, q: ['Rostam mourns Sohrab', 'Rustam Mortally Wounds Suhrab'], accept: /sohrab|suhrab/i },
        ],
        rostam_afrasiab: [
            { n: 1, q: ['Rostam Afrasiab', 'Rustam Afrasiyab'], accept: /rostam|rustam|afrasiab/i },
            { n: 2, q: ['Rostam battle Shahnameh', 'Rustam combat Turan'], accept: /rostam|rustam/i },
            { n: 3, q: ['Afrasiab Shahnameh', 'Rustam sleeping Rakhsh'], accept: /afrasiab|rostam|rustam/i },
            { n: 4, q: ['Rostam div Shahnameh', 'Rustam demon'], accept: /rostam|rustam/i },
            { n: 5, q: ['Rostam seven heroes Shahnameh', 'Haft Goran Rostam'], accept: /rostam|rustam/i },
            { n: 6, q: ['Rostam Turan battle', 'Rustam Turkestan Shahnameh'], accept: /rostam|rustam|turan/i },
            { n: 7, q: ['Afrasiab captured Kay Khosrow', 'Afrasiab death Shahnameh'], accept: /afrasiab/i },
        ],
        siavoshan: [
            { n: 1, q: ['birth of Siyavash', 'Siyavush Shahnameh'], accept: /siyav|siyaw|siav/i },
            { n: 2, q: ['Siyavash Rostam', 'Siyavush learning'], accept: /siyav|siyaw|siav|rostam/i },
            { n: 3, q: ['Siyavash Sudaba', 'Siyavush Sudabeh'], accept: /siyav|siyaw|siav|sudab/i },
            { n: 4, q: ['Siyavash fire ordeal', 'Siyavush passing through fire'], accept: /siyav|siyaw|siav|fire/i },
            { n: 5, q: ['Siyavash Turan', 'Siyavush Afrasiab'], accept: /siyav|siyaw|siav/i },
            { n: 6, q: ['Siyavash Farangis', 'Siyavush Farigis'], accept: /siyav|siyaw|siav|farang/i },
            { n: 7, q: ['death of Siyavash', 'Siyavush killed'], accept: /siyav|siyaw|siav/i },
            { n: 8, q: ['Kay Khosrow revenge Afrasiab', 'Kai Khusrau Shahnameh'], accept: /khosrow|khusraw|kay/i },
        ],
        bizhan: [
            { n: 1, q: ['Bizhan hunting Shahnameh', 'Bijan Manijeh miniature'], accept: /bizhan|bijan|manizh|manije/i },
            { n: 2, q: ['Bizhan Manizheh', 'Bijan Manijeh'], accept: /bizhan|bijan|manizh|manije/i },
            { n: 3, q: ['Afrasiab Bizhan', 'Bijan Manijeh Afrasiab'], accept: /bizhan|bijan|manizh|manije|afrasiab/i },
            { n: 4, q: ['Manizheh Shahnameh', 'Manijeh Iran'], accept: /manizh|manije|bijan|bizhan/i },
            { n: 5, q: ['Rostam rescues Bizhan', 'Rustam Bijan well'], accept: /rostam|rustam|bizhan|bijan/i },
            { n: 6, q: ['Rostam Bizhan return', 'Bizhan Manizheh return'], accept: /bizhan|bijan|rostam|rustam/i },
        ],
        zal_rudabeh: [
            { n: 1, q: ['Zal Simurgh mount', 'Zal born Shahnameh'], accept: /zal|simurgh/i },
            { n: 2, q: ['Zal returns Sam', 'Zal Shahnameh'], accept: /zal/i },
            { n: 3, q: ['Zal Rudabeh', 'Zal Rudaba'], accept: /zal|rudab/i },
            { n: 4, q: ['Rudabeh hair Zal', 'Zal Rudabeh fire'], accept: /zal|rudab/i },
            { n: 5, q: ['birth of Rostam', 'Rostam infant Shahnameh'], accept: /rostam|rustam/i },
        ],
        arash: [
            { n: 1, q: ['Arash archer', 'Arash Kamangir'], accept: /arash/i },
        ],
        khosrow_shirin: [
            { n: 1, q: ['Khusrau Shirin', 'Khosrow Shirin miniature'], accept: /khu?sra?w?|shirin/i },
            { n: 2, q: ['Shirin bathing Khusrau', 'Khusrau Shirin bathing'], accept: /shirin|khu?sra?w?/i },
            { n: 3, q: ['Farhad Shirin', 'Farhad carving mountain'], accept: /farhad/i },
            { n: 4, q: ['Khusrau Farhad', 'Khosrow Shirin court'], accept: /khu?sra?w?|farhad/i },
            { n: 5, q: ['death of Farhad', 'Farhad Shirin tragic'], accept: /farhad/i },
            { n: 6, q: ['Khusrau Shirin reunion', 'Khosrow Shirin palace'], accept: /khu?sra?w?|shirin/i },
        ],
        haft_peykar: [
            { n: 1, q: ['Bahram Gur', 'Bahram V Shahnameh'], accept: /bahram/i },
            { n: 2, q: ['Haft Paykar', 'Bahram Gur seven pavilions'], accept: /bahram|haft|paykar/i },
            { n: 3, q: ['Bahram Gur princess', 'Bahram Gur night story'], accept: /bahram/i },
            { n: 4, q: ['Bahram Gur hunting', 'Bahram Gur hunt'], accept: /bahram/i },
            { n: 5, q: ['death of Bahram Gur', 'Bahram Gur last'], accept: /bahram/i },
        ],
        kurosh: [
            { n: 1, q: ['Cyrus the Great birth', 'Cyrus infant legend'], accept: /cyrus/i },
            { n: 2, q: ['Cyrus the Great', 'Cyrus youth'], accept: /cyrus/i },
            { n: 3, q: ['Cyrus Astyages', 'Persian revolt Medes'], accept: /cyrus|astyages|medes/i },
            { n: 4, q: ['Cyrus Croesus', 'Croesus Lydia'], accept: /cyrus|croesus|lydia/i },
            { n: 5, q: ['Cyrus Babylon', 'Fall of Babylon Cyrus'], accept: /cyrus|babylon/i },
            { n: 6, q: ['Cyrus Cylinder'], accept: /cyrus|cylinder/i },
        ],
        zahhak: [
            { n: 1, q: ['Zahhak Shahnameh', 'Zahhak serpents'], accept: /zahhak|zohak/i },
            { n: 2, q: ['Kaveh blacksmith', 'Kaveh Shahnameh'], accept: /kaveh|kavah/i },
            { n: 3, q: ['Faridun Kaveh', 'Fereydun Shahnameh'], accept: /faridun|fereydun|kaveh/i },
            { n: 4, q: ['Faridun Zahhak battle', 'Fereydun defeats Zahhak'], accept: /faridun|fereydun|zahhak/i },
            { n: 5, q: ['Zahhak chained Damavand', 'Zahhak bound mountain'], accept: /zahhak|zohak|damavand/i },
        ],
        kaveh: [
            { n: 1, q: ['Kaveh blacksmith', 'Kaveh Shahnameh'], accept: /kaveh|kavah/i },
            { n: 2, q: ['Derafsh Kaviani', 'Kaveh banner'], accept: /kaveh|kavah|derafsh/i },
            { n: 3, q: ['Faridun Kaveh', 'Fereydun Shahnameh'], accept: /faridun|fereydun|kaveh/i },
            { n: 4, q: ['Zahhak chained', 'Faridun Zahhak'], accept: /zahhak|faridun|fereydun/i },
        ],
        esfandiyar: [
            { n: 1, q: ["Isfandiyar's First Course wolves", 'Isfandiyar wolf'], accept: /isfandiyar|esfandiyar/i },
            { n: 2, q: ['Isfandiyar dragon lion', "Isfandiyar's Second Course"], accept: /isfandiyar|esfandiyar/i },
            { n: 3, q: ['Isfandiyar witch', "Isfandiyar's Third Course"], accept: /isfandiyar|esfandiyar/i },
            { n: 4, q: ['Isfandiyar Simurgh', "Isfandiyar's Fourth Course"], accept: /isfandiyar|esfandiyar|simurgh/i },
            { n: 5, q: ["Isfandiyar's Fifth Course", 'Isfandiyar fire'], accept: /isfandiyar|esfandiyar/i },
            { n: 6, q: ["Isfandiyar's Sixth Course", 'Isfandiyar seventh course'], accept: /isfandiyar|esfandiyar/i },
            { n: 7, q: ['Isfandiyar Arjasp', "Isfandiyar's Seventh Course"], accept: /isfandiyar|esfandiyar/i },
        ],
        rostam_esfandiyar: [
            { n: 1, q: ['Goshtasp Esfandiyar', 'Isfandiyar Rostam message'], accept: /isfandiyar|esfandiyar|gushtasp|goshtasp/i },
            { n: 2, q: ['Rostam Isfandiyar combat', 'Rustam Isfandiyar battle'], accept: /rostam|rustam|isfandiyar|esfandiyar/i },
            { n: 3, q: ['Rostam Isfandiyar arrow', 'Rustam shooting Isfandiyar'], accept: /rostam|rustam|isfandiyar|esfandiyar/i },
            { n: 4, q: ['death of Isfandiyar', 'Isfandiyar wounded'], accept: /isfandiyar|esfandiyar/i },
            { n: 5, q: ['Rostam Isfandiyar aftermath', 'Rostam mourning'], accept: /rostam|rustam|isfandiyar|esfandiyar/i },
        ],
        tahmineh: [
            { n: 1, q: ['Rostam Tahmina', 'Rostam Samangan'], accept: /tahmin|rostam/i },
            { n: 2, q: ['Tahmina Rostam night', 'Tahminah Shahnameh'], accept: /tahmin/i },
            { n: 3, q: ['birth of Sohrab', 'Sohrab born'], accept: /sohrab|suhrab/i },
        ],
        zal_simorgh: [
            { n: 1, q: ['Zal Simurgh mountain', 'Zal infant Simurgh'], accept: /zal|simurgh/i },
            { n: 2, q: ['Simurgh Shahnameh', 'Simurgh Persian miniature'], accept: /simurgh|simorgh/i },
            { n: 3, q: ['Zal Simurgh nest', 'Simurgh feeding Zal'], accept: /zal|simurgh/i },
            { n: 4, q: ['Zal returns Sam', 'Zal Shahnameh reunion'], accept: /zal/i },
            { n: 5, q: ['Zal hero Shahnameh', 'Zal father Rostam'], accept: /zal/i },
        ],
        kaykhosrow: [
            { n: 1, q: ['Kay Khosrow enthroned', 'Kai Khusrau Shahnameh'], accept: /khosrow|khusraw|kay/i },
            { n: 2, q: ['Kay Khosrow army', 'Kai Khusrau battle'], accept: /khosrow|khusraw|kay/i },
            { n: 3, q: ['Kay Khosrow Afrasiab battle', 'Kai Khusrau Afrasiyab'], accept: /khosrow|khusraw|kay|afrasiab/i },
            { n: 4, q: ['Afrasiab drowning', 'Afrasiab lake'], accept: /afrasiab/i },
            { n: 5, q: ['Kay Khosrow victory', 'Kai Khusrau returns'], accept: /khosrow|khusraw|kay/i },
            { n: 6, q: ['Kay Khosrow Shahnameh', 'Kai Khusrau reign'], accept: /khosrow|khusraw|kay/i },
        ],
        rostam_death: [
            { n: 1, q: ['Shaghad Rostam', 'Shaghad well'], accept: /shaghad|shaghad|rostam|rustam/i },
            { n: 2, q: ['Rostam well Shaghad', 'death of Rustam'], accept: /rostam|rustam/i },
            { n: 3, q: ['Rostam last arrow', 'Rustam death Shahnameh'], accept: /rostam|rustam/i },
            { n: 4, q: ['Rakhsh horse', 'Rustam Rakhsh death'], accept: /rakhsh|rostam|rustam/i },
            { n: 5, q: ['death of Rustam Shahnameh', 'Rustam tomb'], accept: /rostam|rustam/i },
        ],
        rostam_akvan: [
            { n: 1, q: ['Akvan Div', 'Akvan demon Rostam'], accept: /akvan|rostam|rustam/i },
            { n: 2, q: ['Rostam Akvan', 'Rustam demon mountain'], accept: /akvan|rostam|rustam/i },
            { n: 3, q: ['Rostam Akvan victory', 'Rustam div Shahnameh'], accept: /rostam|rustam|akvan/i },
        ],
        hushang: [
            { n: 1, q: ['Hushang Shahnameh', 'Hushang king'], accept: /hushang|hoshang/i },
            { n: 2, q: ['Hushang fire', 'discovery of fire Shahnameh'], accept: /hushang|hoshang|fire/i },
            { n: 3, q: ['Sadeh festival', 'Sadeh fire Iran'], accept: /sadeh|fire/i },
        ],
        jamshid: [
            { n: 1, q: ['Jamshid Shahnameh', 'Jamshid king'], accept: /jamshid/i },
            { n: 2, q: ['Persepolis Apadana', 'Persepolis relief'], accept: /persepolis|apadana/i },
            { n: 3, q: ['Jamshid glory', 'Jamshid throne'], accept: /jamshid/i },
            { n: 4, q: ['Zahhak Jamshid', 'Jamshid fall'], accept: /jamshid|zahhak/i },
            { n: 5, q: ['Persepolis ruins', 'Takht-e Jamshid'], accept: /persepolis|jamshid/i },
        ],
        anushirvan: [
            { n: 1, q: ['Khosrow I Anushirvan', 'Anushirvan king'], accept: /anushir|anusir|khusrau|khosrow/i },
            { n: 2, q: ['Bozorgmehr', 'Buzurjmihr'], accept: /bozorgmehr|buzurj|buzurgmihr/i },
            { n: 3, q: ['Sassanid Byzantine war', 'Khosrow II Byzantine'], accept: /sassan|byzant|khosrow|khusrau/i },
            { n: 4, q: ['Taq Kasra', 'Ctesiphon arch'], accept: /taq|ctesiphon|kasra/i },
        ],
        mosaddegh: [
            { n: 1, q: ['Mohammad Mosaddegh oil nationalization', 'Mosaddegh parliament'], accept: /mosadde|mossade/i },
            { n: 2, q: ['1953 Iranian coup', 'Operation Ajax Iran'], accept: /coup|ajax|mosadde|mossade|tehran/i },
            { n: 3, q: ['Mosaddegh trial', 'Mosaddegh court'], accept: /mosadde|mossade/i },
            { n: 4, q: ['Mohammad Mosaddegh portrait'], accept: /mosadde|mossade/i },
        ],
        hassan_kachal: [
            { n: 1, q: ['Persian miniature garden', 'Persian painting garden feast'], accept: /garden|feast|miniature/i },
            { n: 2, q: ['Persian miniature garden', 'Persian painting garden'], accept: /garden|miniature/i },
            { n: 3, q: ['Persian miniature div demon', 'Persian painting demon'], accept: /div|demon|miniature/i },
        ],
        farsi_aval: [
            { n: 1, q: ['water drop splash', 'clear water surface'], accept: /water/i },
            { n: 2, q: ['rain clouds Iran', 'rain drops'], accept: /rain/i },
            { n: 3, q: ['classroom Iran school', 'school children Iran'], accept: /school|class|student/i },
            { n: 4, q: ['pomegranate fruit', 'pomegranate tree'], accept: /pomegranate/i },
            { n: 5, q: ['Iran flag', 'map of Iran'], accept: /iran/i },
            { n: 6, q: ['human body anatomy illustration'], accept: /body|anatomy|human/i },
            { n: 7, q: ['red fox'], accept: /fox/i },
            { n: 8, q: ['Iranian family', 'Persian family'], accept: /family/i },
            { n: 9, q: ['forest Iran', 'Hyrcanian forest'], accept: /forest/i },
            { n: 10, q: ['birthday cake candles'], accept: /cake|birthday/i },
        ],
        medes: [
            { n: 1, q: ['Ecbatana', 'Hegmataneh Hamadan'], accept: /ecbatana|hegmataneh|hamadan/i },
            { n: 2, q: ['Median dress horseman', 'Medes relief'], accept: /median|medes|meder/i },
            { n: 3, q: ['Battle of Nineveh', 'Fall of Nineveh'], accept: /nineveh/i },
            { n: 4, q: ['Astyages Cyrus', 'Astyages dream'], accept: /astyag/i },
        ],
        achaemenids: [
            { n: 1, q: ['Cyrus the Great', 'Pasargadae'], accept: /cyrus|pasargad/i },
            { n: 2, q: ['Fall of Babylon', 'Croesus Cyrus'], accept: /babylon|croesus/i },
            { n: 3, q: ['Cyrus Cylinder'], accept: /cyrus cylinder/i },
            { n: 4, q: ['Persepolis Apadana relief', 'Darius Persepolis'], accept: /apadana|persepolis|darius/i },
            { n: 5, q: ['Battle of Salamis painting', 'Xerxes'], accept: /salamis|xerxes/i },
            { n: 6, q: ['Alexander Mosaic Issus', 'Gaugamela'], accept: /alexander|issus|gaugamela/i },
        ],
        parthians: [
            { n: 1, q: ['Parthian coin Arsaces', 'Arsaces I'], accept: /parthia|arsaces|drachma|tetradrachm/i },
            { n: 2, q: ['Mithridates Parthian relief', 'Parthian relief'], accept: /mithridat|parthian/i },
            { n: 3, q: ['Battle of Carrhae', 'Crassus Parthians'], accept: /carrhae|crassus/i },
            { n: 4, q: ['Ardashir I relief Naqsh-e Rostam', 'Ardashir investiture'], accept: /ardashir/i },
        ],
        sassanids: [
            { n: 1, q: ['Ardashir I relief', 'Ardashir Firuzabad'], accept: /ardashir|ardes?hir/i },
            { n: 2, q: ['Shapur I Valerian relief'], accept: /shapur/i },
            { n: 3, q: ['Taq Kasra Ctesiphon'], accept: /taq|ctesiphon|kasra/i },
            { n: 4, q: ['Sasanian plate Khosrow', 'Sasanian silver plate'], accept: /sassan|sasanian|khosrow/i },
            { n: 5, q: ['Battle of al-Qadisiyyah', 'Arab conquest Persia'], accept: /qadisiy|qadisiyyah|arab/i },
        ],
        seljuks: [
            { n: 1, q: ['Court of Seljuk ruler Tughril', 'Tughril Seljuk'], accept: /tughril|seljuk/i },
            { n: 2, q: ['Battle of Manzikert', 'Malazgirt'], accept: /manzikert|malazgirt|malazkirt/i },
            { n: 3, q: ['Nizam al-Mulk', 'Assassination of Nizam al-Mulk'], accept: /nizam/i },
            { n: 4, q: ['Sultan Sanjar Mausoleum'], accept: /sanjar/i },
        ],
        safavids: [
            { n: 1, q: ['Sheikh Safi al-Din shrine', 'Sheikh Safi Ardabil'], accept: /safi/i },
            { n: 2, q: ['Shah Ismail I', 'Ismail Safavid'], accept: /ismail|esmaeil|safavid/i },
            { n: 3, q: ['Naqsh-e Jahan Square Isfahan', 'Shah Abbas Isfahan'], accept: /naqsh|naghsh|isfahan/i },
            { n: 4, q: ['Battle of Chaldiran', 'Chalderan'], accept: /chaldiran|chalderan/i },
            { n: 5, q: ['Siege of Isfahan', 'Fall of Isfahan'], accept: /isfahan|siege/i },
        ],
        qajars: [
            { n: 1, q: ['Agha Mohammad Khan Qajar'], accept: /agha mohammad|agha muhammad/i },
            { n: 2, q: ['Fath Ali Shah Russia war', 'Russo-Persian War'], accept: /fath|russia|yerevan|erevan/i },
            { n: 3, q: ['Amir Kabir portrait', 'Amir Kabir'], accept: /amir kabir|amirkabir/i },
            { n: 4, q: ['Persian Constitutional Revolution'], accept: /constitution|mashrut/i },
            { n: 5, q: ['Ahmad Shah Qajar', 'End of Qajar'], accept: /ahmad/i },
        ],
    },
};

/**
 * Hand-picked Commons files.
 *
 * Values are unique substrings of the Commons file title rather than the full
 * name: Commons titles carry long museum suffixes that change when a file is
 * re-uploaded, and a substring is easier to audit. A pick is used only when it
 * matches exactly one candidate; otherwise the scorer picks automatically.
 */
const PICKS = {
    rostam_7: {
        cover: 'Abd al-Vahhab - Rustam\'s seventh course- He kills the White Div, folio 124 from a Shah-nama - 1988.96.a - Cleveland Museum of Art.jpg',
        // All seven feats from one manuscript (Walters W.597) so the campaign
        // reads as a single illustrated set; only the desert halt is taken from
        // the Tahmasp Shahnama, which is the sole scan of that labour.
        ch: {
            1: 'W.597, fol. 42b',
            2: 'Folio 118r from the Shahnama of Shah Tahmasp',
            3: 'W.597, fol. 43b',
            4: 'W.597, fol. 44b.jpg',
            5: 'W.597, fol. 45b',
            6: 'W.597, fol. 47b',
            7: 'W.597, fol. 48b',
        },
    },
    rostam_sohrab: {
        cover: 'The Tragedy of Rustam and Suhrab',
        ch: {
            1: 'Khalili Collection Islamic Art mss 1030 fol 135b',
            2: 'Tahmīna Visits Rustam in his Chamber',
            3: 'Tahminah.jpg',
            4: 'The birth of Rustam, signed Hajji Muhammad',
            5: 'Sohrab and Hojir',
            6: 'Rostam va Sohrab.jpg',
            7: 'Rustam Mortally Wounds Suhrab - Walters W600115A',
        },
    },
    rostam_afrasiab: {
        cover: 'Rustam lifts Afrasiyab by the belt',
        ch: {
            1: 'Afrasiyab Killing Naudar',
            2: 'Rostam\'s Battle with Afrasiab, the Turanian King',
            3: 'Rustam Battles Sava',
            4: 'Rustam killing the White Div',
            5: 'Rustam and the seven heroes fight the Turanians',
            6: 'Iran–Turan War',
            7: 'MET DP108570',
        },
    },
    tahmineh: {
        cover: 'Tahminah.jpg',
        ch: {
            1: 'Tahmīna Visits Rustam in his Chamber',
            2: 'Rostam and Tahmina by Joseph Rotter',
            3: 'The birth of Rustam, signed Hajji Muhammad',
        },
    },
    siavoshan: {
        cover: 'Fire Ordeal of Siyavush, Folio from a Shahnama (Book of Kings) LACMA',
        ch: {
            1: 'Siyāvash and Shabrang',
            2: 'Siyavush plays polo before Afrasiyab (CBL',
            3: '"Siyavush Stands Accused by Sudaba before Kai Kavus", Folio 163v',
            4: 'Firdawsi - The Fire Ordeal of Siyavush - Walters W602113B',
            5: 'Afrasiyab and Siyavush Embrace',
            6: 'MET DP107144',
            7: 'Murder of Siyavush at the bidding of Garsivaz',
            8: 'Kai Khusrau Slays Afrasiyab',
        },
    },
    bizhan: {
        cover: 'Rustam rescues Bizhan from the Pit", Folio from a Shahnama (Book of Kings) MET DP215759',
        ch: {
            1: 'Bizhan Slaughters the Wild Boars of Irman", Folio from a Shahnama (Book of Kings) MET DP215646',
            2: 'Bizhan Receives an Invitation through Manizha',
            3: 'Bizhan is captured in Manizha',
            4: 'Bizhan Shahnameh Met 1970.301.42',
            5: 'LACMA M.73.5.434',
            6: 'Firdawsi - Rustam Rescues Bizhan from the Pit - Walters W601308B',
        },
    },
    zal_rudabeh: {
        cover: 'meeting of Zal and Rudaba in her castle',
        ch: {
            1: '"Birth of Zal", Folio from a Shahnama (Book of Kings) MET DP215767',
            2: '"Zal Returned to Sam", Folio from a Shahnama (Book of Kings) MET DP215865',
            3: 'King Mihrab of Kabul learns of Rudabeh',
            4: 'The Story of Zal & Rudaba in the Şehnâme-i Türkî',
            5: 'simurgh arrives to assist with the birth of Rustam',
        },
    },
    farsi_aval: { cover: 'Iranpreschool.jpg', ch: { 5: 'Flag of Iran in Azadi Stadium' } },
    arash: {
        cover: 'مجسمه آرش کمانگیر، مجموعه کاخ سعدآباد',
        ch: { 1: 'Arash Kamangir Yazd' },
    },
    khosrow_shirin: {
        cover: 'Khusraw at the castle of Shirin',
        ch: {
            1: 'Farrukh - Shirin Receives a Ring from Khusraw - Walters W62480A',
            2: 'Shirin bathing, being approached by Khusraw',
            3: 'Farhad Carves an Image of Shirin in Rock',
            4: 'Shirin meets Farhad',
            5: 'Farhad receives the News of Shirin',
            6: 'Khusrau and Shirin MET DP236651',
        },
    },
    haft_peykar: {
        cover: 'Bahram Gur in the Red Pavilion',
        ch: {
            1: 'Bahram Gur hunting.jpg',
            2: 'Bahram Gur and the Princesses of the seven pavillions',
            3: 'Dome of Piruza',
            4: 'Hunting Onagers with Fitna',
            5: 'Bahram Gur proves his worthiness by killing a dragon',
        },
    },
    kurosh: {
        cover: 'Cyrus Cylinder BM ME90920',
        ch: {
            1: 'Childhood of King Cyrus',
            2: 'Jean Charles Nicaise Perrin - Cyrus and Astyages',
            3: 'The Defeat of Astyages (complete)',
            4: 'Gaspar van den Hoecke - Croesus before Cyrus',
            5: 'John Martin - Belshazzar\'s Feast - Google Art Project',
            6: 'Tomb of Cyrus the Great.jpg',
        },
    },
    zahhak: {
        cover: 'Sultan Muhammad Tiran Zahhak',
        ch: {
            1: 'Zahhak enthroned (6125043266)',
            2: 'Zahhak bound by Fereydun, whilst Kaveh',
            3: 'Faridun in the Palace of Zahhak", Folio from a Shahnama (Book of Kings) MET DP215863',
            4: 'Faridun strikes Zahhak with the ox-headed mace',
            5: 'Zahhak is nailed to the walls of a cave in Mount Damavand',
        },
    },
    kaveh: {
        cover: 'Folio 31v from the Shahnama of Shah Tahmasp',
        ch: {
            1: 'Zahhak bound by Fereydun, whilst Kaveh',
            2: 'attacco di faridun al palazzo di zahhak',
            3: 'Faridun crosses the Tigris on his way to fight',
            4: 'Zahhak chained on Mt. Damavand',
        },
    },
    esfandiyar: {
        cover: "Isfandiyar’s Fifth Ordeal",
        ch: {
            1: 'SchoolOfTabriz4',
            2: "Isfandiyar's Second Course- He Slays the Lions",
            3: 'MET DP107167',
            4: 'Isfandiyar kills the Simurgh',
            5: 'Isfandiyar Slays the Fire-Breathing Dragon',
            6: 'MET ISL130',
            7: 'Isfandiyar Slays Arjasp", Folio from a Shahnama (Book of Kings) MET DP108577',
        },
    },
    rostam_esfandiyar: {
        cover: 'Rustam Shoots Isfandiyar in the Eyes, folio from the Great Ilkhanid',
        ch: {
            1: 'Rustam Discoursing with Isfandiyar", Folio from a Shahnama (Book of Kings) MET DP215881',
            2: 'testing each other',
            3: 'Shoots Isfandiyar in the Eye", Folio from a Shahnama (Book of Kings) MET DP215911',
            4: 'Rustam Slays Isfandiyar", Folio 466r',
            5: 'Funeral of Isfandiyar", Folio from a Shahnama (Book of Kings) MET DT460',
        },
    },
    zal_simorgh: {
        cover: "Zal in the Simurgh's Nest",
        ch: {
            1: 'Zal Rescued by the Simurgh',
            2: 'The Simurgh carries Zal to her nest Wellcome L0032343',
            3: "'Zal and the Simurgh', ink and opaque watercolor",
            4: 'Zal is Restored to his Father Sam',
            5: 'Caesarean Birth of Rustam',
        },
    },
    kaykhosrow: {
        cover: 'Battle between Kai Khusrau and Afrasiyab',
        ch: {
            1: 'The party after homage paid to Kay Khosraw',
            2: 'Kay Khusraw Leads his Force against Afrasiyab and the Turanian Army',
            3: 'Night Battle of Kai Khusrau and Afrasiyab',
            4: 'The Battle Between Kay Khusraw and the King of Makran',
            5: 'Kay Khusraw Welcomed by his Grandfather',
            6: 'Kay Khusraw feasting the hero Rustam',
        },
    },
    rostam_death: {
        cover: 'death of the hero Rustam and his horse Rakhsh, Folio from the Great Mongol',
        ch: {
            1: 'Rustam Battling Shaghad from a Shahnameh manuscript, Shangri La',
            2: 'Rustam Falls in the Spear-Lined Pit',
            3: 'Rustam shoots Shaghad through the tree, Safavid Isfahan',
            4: 'Dood van Rustam en van Shaghad',
            5: 'The death of the hero Rustam and his horse Rakhsh.jpg',
        },
    },
    rostam_akvan: {
        cover: 'Shahnameh - The Div Akvan throws Rustam into the sea',
        ch: {
            1: 'Div Akvan lifts the sleeping Rustam',
            2: 'Rustam Pursues Akvan, The Onager-Div',
            3: 'Rakhsh Defends Rustam from the Div Akvan',
        },
    },
    hushang: {
        cover: 'Hushang kills the black demon',
        ch: {
            1: 'Hushang Slays the Black Div',
            2: 'Hushang Discovers Fire',
            3: 'MET DP107689',
        },
    },
    jamshid: {
        cover: 'A monumental portrait of King Jamshid',
        ch: {
            1: 'Jamshid teaches the crafts to humanity',
            2: 'Persepolis Apadana ES NP',
            3: 'Jamshid Writing on a Rock',
            4: 'Zahhak, King of the Arabs, Enthroned as the Shahanshah of Persia, Replacing Jamshid',
            5: 'Persepolis Panorama 2',
        },
    },
    anushirvan: {
        cover: 'King Khusraw Anushirvan Enthroned',
        ch: {
            1: 'Khosrow I Anushirvan and Al-Mundhir',
            2: 'Nushirwan Holds a Banquet for his Minister Buzurgmihr',
            3: 'Plate of Khosrow I Anushirvan.jpg',
            4: 'Taq Kasra.jpg',
        },
    },
    mosaddegh: {
        cover: 'Portrait of Mohammad Mosaddegh - circa 1952.jpg',
        ch: {
            1: 'Dr Mohammad Mosaddeq.jpg',
            2: 'Guards in front of Mosaddeq',
            3: 'court martial by Ebrahim Golestan (1)',
            4: 'Mohammad Mosaddegh circa1950s.png',
        },
    },
    medes: {
        cover: 'People of Medes 01',
        ch: {
            1: 'Ecbatana, Iran - 50897009088',
            2: 'Horseman in Median dress',
            3: 'Fall of nineveh.jpg',
            4: 'Cyrus and Astyages - WGA17209',
        },
    },
    achaemenids: {
        cover: 'Medes and Persians at eastern stairs of the Apadana',
        ch: {
            1: 'Tomb of Cyrus the Great.jpg',
            2: 'The fall of Babylon; Cyrus the Great defeating the Chaldean',
            3: 'Cyrus Cylinder BM ME90920',
            4: 'Persepolis stairs of the Apadana relief',
            5: 'Die Seeschlacht bei Salamis - 1868',
            6: 'Alexander Mosaic (6000 x 3730)',
        },
    },
    parthians: {
        cover: 'Shami statue, 1.94 metre-high bronze statue',
        ch: {
            1: 'Drachma with Mithridates I',
            2: 'Xong-e Ashdar Parthian relief',
            3: 'Fired clay plaque showing a mounted archer',
            4: "Naqsh-e Rostam Investiture d'Ardashir Ier",
        },
    },
    sassanids: {
        cover: 'The Arch of Ctesiphon (Taq Kasra)',
        ch: {
            1: "Ardashir i's relief at Firuzabad",
            2: 'Relief of Shapur I capturing Valerian',
            3: 'Taq Kasra.jpg',
            4: 'Sasanian plate royal hunt Musée BnF inv56-364',
            5: 'Saad ibn Waqqas Kills Rustam',
        },
    },
    seljuks: {
        cover: 'Seljuk Sultan Malik Shah at his court',
        ch: {
            1: 'Court of Seljuk ruler Tughril III',
            2: 'Istanbul Military Museum Historic images Battle of Manzikert in 2016 01 9254',
            3: 'Malik-Shah I (portrait)',
            4: '1911 Colour photo of the Mausoleum of Sultan Sanjar',
        },
    },
    safavids: {
        cover: 'Shah abbas I- L by Bishn Das',
        ch: {
            1: 'Interior view of the dome of the Sheikh Safi al-Din Shrine',
            2: 'I İsmail and Babur shah (1665 painting)',
            3: 'Mezquita Shah, Isfahán, Irán, 2016-09-20, DD 64',
            4: 'The Battle of Chaldiran, Qajar Iran, 19th century',
            5: 'Isfahan to the south side by Eugène Flandin',
        },
    },
    qajars: {
        cover: 'Portrait of Fath Ali Shah Qajar, Iran, 1811, The David Collection',
        ch: {
            1: 'Agha Mohammad Khan Qajar, painting, ca. 1840',
            2: "Fath Ali Shah's Victory over the Russians at Yerevan",
            3: 'Painting of Amir Kabir from Sharh-e Haal-e Rejaal-e Iran',
            4: 'Conquerors of Tehran (Constitutional Movement)',
            5: 'AhmadShahQajar2.jpg',
        },
    },
};

module.exports = { BOOKS, PICKS };

