# Card image credits

The 109 World Map card photos in `public/images/legends/` are mirrored from
Wikimedia Commons so the game never depends on a third-party host at runtime
(Commons rate-limits bulk requests with HTTP 429, which used to leave cards blank).

Each file is a downscaled (max 520px wide, JPEG q78) copy of the Commons file below.
Licences are those of the original Commons files — check the source page before
redistributing.

## How they were fetched

Commons rate-limits by **request rate**, not volume: a burst of concurrent
requests gets HTTP 429 while the same requests paced a couple of seconds apart
succeed. Two things to know if you ever re-mirror:

- A handful of files are *full-size original* URLs (`.../commons/a/ab/File.jpg`).
  Those are throttled much harder than `/thumb/` URLs. Fetch them through the
  thumbnail endpoint instead:
  `.../commons/thumb/<a>/<ab>/<File>/500px-<File>`.
- Commons only serves a **fixed set of thumbnail widths** — anything else is
  `400: Use thumbnail sizes listed on https://w.wiki/GHai`. `500px` works;
  520/640/800/1024 do not.

Source pages:

- `maradona_villa.jpg` — https://commons.wikimedia.org/wiki/File:Maradona_en_el_juvenil_1979.jpg
- `maradona_debut.jpg` — https://commons.wikimedia.org/wiki/File:Maradona_fiesta_juvenil_1979.jpg
- `maradona_barcelona.jpg` — https://commons.wikimedia.org/wiki/File:Maradona-Mundial_86_con_la_copa.JPG
- `maradona_napoli.jpg` — https://commons.wikimedia.org/wiki/File:Maradona-Mundial_86_con_la_copa.JPG
- `maradona_1986.jpg` — https://commons.wikimedia.org/wiki/File:Maradona_1986_vs_italy.jpg
- `maradona_legacy.jpg` — https://commons.wikimedia.org/wiki/File:Maradona-Mundial_86_con_la_copa.JPG
- `messi_rosario.jpg` — https://commons.wikimedia.org/wiki/File:Leo_messi_barce_2005.jpg
- `messi_napkin.jpg` — https://commons.wikimedia.org/wiki/File:Leo_messi_barce_2005.jpg
- `messi_number10.jpg` — https://commons.wikimedia.org/wiki/File:Lionel_Messi_vs_Valladolid.jpg
- `messi_91goals.jpg` — https://commons.wikimedia.org/wiki/File:Lionel_Messi_20180626.jpg
- `messi_copa.jpg` — https://commons.wikimedia.org/wiki/File:Argentina_vs_mexico_messi_vs_erick_gutierrez_%28cropped%29.jpg
- `messi_worldcup.jpg` — https://commons.wikimedia.org/wiki/File:Argentina_vs_mexico_messi_vs_erick_gutierrez_%28cropped%29.jpg
- `messi_miami.jpg` — https://commons.wikimedia.org/wiki/File:Lionel_Messi_20180626.jpg
- `ronaldo_madeira.jpg` — https://commons.wikimedia.org/wiki/File:Cristiano_Ronaldo_%28links_unten%29_im_EM-Halbfinale_gegen_die_Niederlande_%28cropped%29.jpg
- `ronaldo_sporting.jpg` — https://commons.wikimedia.org/wiki/File:Ronaldo_-_Manchester_United_vs_Chelsea.jpg
- `ronaldo_united.jpg` — https://commons.wikimedia.org/wiki/File:Cristiano_Ronaldo_of_Manchester_United%2C_November_5%2C_2008.jpg
- `ronaldo_real.jpg` — https://commons.wikimedia.org/wiki/File:Ronaldo_vs_Ludogorets_%2851101071755%29_%28Ronaldo_cropped%29.jpg
- `ronaldo_euro.jpg` — https://commons.wikimedia.org/wiki/File:Cristiano_Ronaldo_Euro_2016.jpg
- `ronaldo_nasr.jpg` — https://commons.wikimedia.org/wiki/File:Cristiano_Ronaldo_playing_for_Al_Nassr_FC_against_Persepolis%2C_September_2023_%28cropped%29.jpg
- `pele_bauru.jpg` — https://commons.wikimedia.org/wiki/File:Rei_Pel%C3%A933.JPG
- `pele_santos.jpg` — https://commons.wikimedia.org/wiki/File:Pel%C3%A9_goal_1958_WC_final.jpg
- `pele_1958.jpg` — https://commons.wikimedia.org/wiki/File:Pel%C3%A9_goal_1958_WC_final.jpg
- `pele_triple.jpg` — https://commons.wikimedia.org/wiki/File:Pele_con_brasil_%28cropped%29.jpg
- `pele_rei.jpg` — https://commons.wikimedia.org/wiki/File:Rei_Pel%C3%A933.JPG
- `zidane_marseille.jpg` — https://commons.wikimedia.org/wiki/File:Zinedine_Zidane_by_Tasnim_03.jpg
- `zidane_juventus.jpg` — https://commons.wikimedia.org/wiki/File:Zinedine_zidane_wcf_2006.jpg
- `zidane_1998.jpg` — https://commons.wikimedia.org/wiki/File:Zinedine_zidane_wcf_2006.jpg
- `zidane_galacticos.jpg` — https://commons.wikimedia.org/wiki/File:Zinedine_Zidane_by_Tasnim_03.jpg
- `zidane_coach.jpg` — https://commons.wikimedia.org/wiki/File:Zinedine_Zidane_by_Tasnim_03.jpg
- `cruyff_betondorp.jpg` — https://commons.wikimedia.org/wiki/File:Ajax_tegen_Anderlecht._Johan_Cruyff_gehuldigd_als_voetballer_van_het_jaar._Cruyf%2C_Bestanddeelnr_920-5736.jpg
- `cruyff_ajax.jpg` — https://commons.wikimedia.org/wiki/File:Johan_Cruyff_1971c.jpg
- `cruyff_barcelona.jpg` — https://commons.wikimedia.org/wiki/File:Johan_Cruyff_1974c.jpg
- `cruyff_dreamteam.jpg` — https://commons.wikimedia.org/wiki/File:Johan_Cruijff_%28Cruyff%29.jpg
- `beckenbauer_munich.jpg` — https://commons.wikimedia.org/wiki/File:Young_Franz_Beckenbauer_before_1966_Football_World_Cup.jpg
- `beckenbauer_bayern.jpg` — https://commons.wikimedia.org/wiki/File:Franz_Beckenbauer_1972.jpg
- `beckenbauer_1974.jpg` — https://commons.wikimedia.org/wiki/File:Finale_wereldkampioenschap_voetbal_1974_in_Munchen%2C_West_Duitsland_tegen_Nederland_2-1%3B_Neeskens%2C_Beckenbauer%2C_Rep_en_Breitner.jpg
- `beckenbauer_coach.jpg` — https://commons.wikimedia.org/wiki/File:Bundesarchiv_Bild_183-1990-1127-023%2C_Leipzig%2C_Bambi-Verleihung%2C_Franz_Beckenbauer_%28cropped%29.jpg
- `ronaldinho_porto_alegre.jpg` — https://commons.wikimedia.org/wiki/File:Ronaldinho.jpg
- `ronaldinho_gremio_psg.jpg` — https://commons.wikimedia.org/wiki/File:Ronaldinho_corner.jpg
- `ronaldinho_barcelona.jpg` — https://commons.wikimedia.org/wiki/File:Ronaldinho061115.jpg
- `ronaldinho_samba.jpg` — https://commons.wikimedia.org/wiki/File:Ronaldinho_Ga%C3%BAcho_2016.jpg
- `ronaldo9_cruzeiro.jpg` — https://commons.wikimedia.org/wiki/File:Salvaronaldo.jpg
- `ronaldo9_europe.jpg` — https://commons.wikimedia.org/wiki/File:Ronaldo_Pallone_d%27oro_1997.jpg
- `ronaldo9_return.jpg` — https://commons.wikimedia.org/wiki/File:Ronaldo_2002_cropped.jpg
- `ronaldo9_legacy.jpg` — https://commons.wikimedia.org/wiki/File:Ronaldo_em_campo.jpg
- `maldini_debut.jpg` — https://commons.wikimedia.org/wiki/File:Roberto_Mancini_e_Paolo_Maldini_Barletta%2C_1998.jpg
- `maldini_sacchi.jpg` — https://commons.wikimedia.org/wiki/File:A.C._Milan_lifting_the_European_Cup_after_winning_the_2002%E2%80%9303_UEFA_Champions_League_-_20030528.jpg
- `maldini_captain.jpg` — https://commons.wikimedia.org/wiki/File:Maldini2008.JPG
- `maldini_legacy.jpg` — https://commons.wikimedia.org/wiki/File:Paolo_Maldini_AC_Milan_Technical_director_2018.jpg
- `eusebio_mozambique.jpg` — https://commons.wikimedia.org/wiki/File:Eusebio_%281963%29.jpg
- `eusebio_benfica.jpg` — https://commons.wikimedia.org/wiki/File:Eusebio_%281963_version2%29.jpg
- `eusebio_1966.jpg` — https://commons.wikimedia.org/wiki/File:Eusebio1965.jpg
- `eusebio_legacy.jpg` — https://commons.wikimedia.org/wiki/File:Eus%C3%A9bio_1972.jpg
- `puskas_budapest.jpg` — https://commons.wikimedia.org/wiki/File:Pusk%C3%A1s_fortepan_54983.jpg
- `puskas_honved.jpg` — https://commons.wikimedia.org/wiki/File:Az_Aranycsapat._L%C3%B3r%C3%A1nt_Gyula%2C_Buz%C3%A1nszky_Jen%C5%91%2C_Hidegk%C3%BAti_N%C3%A1ndor%2C_Kocsis_S%C3%A1ndor%2C_Zakari%C3%A1s_J%C3%B3zsef%2C_Czibor_Zolt%C3%A1n%2C_Bozsik_J%C3%B3zsef%2C_Budai_II_L%C3%A1szl%C3%B3%2C_guggol-_Lantos_Mih%C3%A1ly%2C_Pusk%C3%A1s_Ferenc%2C_Grosics_Gyula._Fortepan_6671.jpg
- `puskas_1954.jpg` — https://commons.wikimedia.org/wiki/File:Les_deux_capitaines_de_la_finale_de_Coupe_du_monde_de_football_1954_%28G._Walter%2C_D._Puskas%2C_arbitre_Orlandini%29.jpg
- `puskas_real.jpg` — https://commons.wikimedia.org/wiki/File:1961%E2%80%9362_European_Cup_-_Juventus_v_Real_Madrid_-_Pusk%C3%A1s%2C_Gento_and_Araquist%C3%A1in.jpg
- `yashin_moscow.jpg` — https://commons.wikimedia.org/wiki/File:Lev_Yashin%2C_fails_to_stop_a_goal_during_the_soccer_match_agains_Israel%2C_1958_D448-092.jpg
- `yashin_dynamo.jpg` — https://commons.wikimedia.org/wiki/File:Lev_Yashin_1960.jpg
- `yashin_ballon.jpg` — https://commons.wikimedia.org/wiki/File:Lev_Yashin_1962.jpg
- `yashin_legacy.jpg` — https://commons.wikimedia.org/wiki/File:Lev_Yashin_1966.jpg
- `best_belfast.jpg` — https://commons.wikimedia.org/wiki/File:Manu-Finland-1965.jpg
- `best_united.jpg` — https://commons.wikimedia.org/wiki/File:Manu-Finland-1965.jpg
- `best_twilight.jpg` — https://commons.wikimedia.org/wiki/File:George_Best_%281976%29.jpg
- `best_legacy.jpg` — https://commons.wikimedia.org/wiki/File:GeorgeBest.jpg
- `platini_joeuf.jpg` — https://commons.wikimedia.org/wiki/File:Michel_Platini_en_1975.jpg
- `platini_juve.jpg` — https://commons.wikimedia.org/wiki/File:Platini_entrevista.jpg
- `platini_euro84.jpg` — https://commons.wikimedia.org/wiki/File:Platini_vs_canada.jpg
- `platini_legacy.jpg` — https://commons.wikimedia.org/wiki/File:Michel_Platini_2008.jpg
- `neymar_santos.jpg` — https://commons.wikimedia.org/wiki/File:Neymar.jpg
- `neymar_santos_star.jpg` — https://commons.wikimedia.org/wiki/File:Neymar_Santos_2011.jpg
- `neymar_barcelona.jpg` — https://commons.wikimedia.org/wiki/File:Neymar_Barcelona_presentation_1.jpg
- `neymar_psg.jpg` — https://commons.wikimedia.org/wiki/File:Neymar_PSG.jpg
- `mbappe_bondy.jpg` — https://commons.wikimedia.org/wiki/File:Kylian_Mbapp%C3%A9_-_2017-05-06.jpg
- `mbappe_monaco.jpg` — https://commons.wikimedia.org/wiki/File:Kylian_Mbappe_2017.jpg
- `mbappe_2018.jpg` — https://commons.wikimedia.org/wiki/File:Kylian_Mbapp%C3%A9_2018.jpg
- `mbappe_real.jpg` — https://commons.wikimedia.org/wiki/File:Kylian_Mbappe_at_Real_Madrid%27s_game_versus_Juventus_Turin_on_22_October_2025.jpeg
- `haaland_bryne.jpg` — https://commons.wikimedia.org/wiki/File:Molde-Zenit_%282%29_Erling_Braut_H%C3%A5land_2018-8-30.jpg
- `haaland_salzburg.jpg` — https://commons.wikimedia.org/wiki/File:FC_RB_Salzburg_gegen_CSKA_Sofia_%28Testspiel_3._Juli_2019%29_14.jpg
- `haaland_dortmund.jpg` — https://commons.wikimedia.org/wiki/File:Erling_Haaland_2020_%28cropped%29.jpg
- `haaland_city.jpg` — https://commons.wikimedia.org/wiki/File:Erling_Haaland_2023.jpg
- `debruyne_genk.jpg` — https://commons.wikimedia.org/wiki/File:Kevin_De_Bruyne_at_Samsung.jpg
- `debruyne_chelsea.jpg` — https://commons.wikimedia.org/wiki/File:Kevin_De_Bruyne_vs_USA.jpg
- `debruyne_city.jpg` — https://commons.wikimedia.org/wiki/File:Kevin_de_Bruyne_2016-12-26.jpg
- `debruyne_belgium.jpg` — https://commons.wikimedia.org/wiki/File:Kevin_De_Bruyne_celebrating_Belgium%27s_2%E2%80%931_win_over_Brazil.jpg
- `modric_zadar.jpg` — https://commons.wikimedia.org/wiki/File:Luka_Modri%C4%87_10052008.jpg
- `modric_dinamo.jpg` — https://commons.wikimedia.org/wiki/File:Luka_Modri%C4%87_2010.jpg
- `modric_real.jpg` — https://commons.wikimedia.org/wiki/File:Luka_Modri%C4%87_Real_Madrid.jpg
- `modric_legacy.jpg` — https://commons.wikimedia.org/wiki/File:Luka_Modri%C4%87_in_2018.jpg
- `salah_nagrig.jpg` — https://commons.wikimedia.org/wiki/File:Mohamed_salah.jpg
- `salah_basel.jpg` — https://commons.wikimedia.org/wiki/File:Mohamed_Salah.JPG
- `salah_roma.jpg` — https://commons.wikimedia.org/wiki/File:Mohamed_Salah_2015.jpg
- `salah_liverpool.jpg` — https://commons.wikimedia.org/wiki/File:Mo_Salah_2018.jpg
- `lewandowski_warsaw.jpg` — https://commons.wikimedia.org/wiki/File:Robert_Lewandowski_2008_profil.jpg
- `lewandowski_dortmund.jpg` — https://commons.wikimedia.org/wiki/File:Robert_Lewandowski_2011.jpg
- `lewandowski_bayern.jpg` — https://commons.wikimedia.org/wiki/File:Robert_Lewandowski-abr_2016.jpg
- `lewandowski_barca.jpg` — https://commons.wikimedia.org/wiki/File:Robert_Lewandowski_%282025%29.png
- `iniesta_fuentealbilla.jpg` — https://commons.wikimedia.org/wiki/File:Andr%C3%A9s_Iniesta_21dec2006.jpg
- `iniesta_barca.jpg` — https://commons.wikimedia.org/wiki/File:Andr%C3%A9s_Iniesta_2011.jpg
- `iniesta_2010.jpg` — https://commons.wikimedia.org/wiki/File:Andres_Iniesta.jpg
- `iniesta_legacy.jpg` — https://commons.wikimedia.org/wiki/File:Andres_Iniesta_2018_%28edited%29.jpg
- `son_chuncheon.jpg` — https://commons.wikimedia.org/wiki/File:Son_Heung-Min.jpg
- `son_hamburg.jpg` — https://commons.wikimedia.org/wiki/File:Son_Heung-Min.jpg
- `son_leverkusen.jpg` — https://commons.wikimedia.org/wiki/File:BFA_Son_Heung_Min_2014.jpg
- `son_tottenham.jpg` — https://commons.wikimedia.org/wiki/File:Son_Heung-min_2016.jpg
- `vandijk_breda.jpg` — https://commons.wikimedia.org/wiki/File:Virgilvandijk.jpg
- `vandijk_celtic.jpg` — https://commons.wikimedia.org/wiki/File:Virgil_van_Dijk_2015.jpg
- `vandijk_southampton.jpg` — https://commons.wikimedia.org/wiki/File:20160604_AUT_NED_8876_%28cropped%29.jpg
- `vandijk_liverpool.jpg` — https://commons.wikimedia.org/wiki/File:Liverpool_vs._Chelsea%2C_UEFA_Super_Cup_2019-08-14_33_%28cropped%29.jpg
