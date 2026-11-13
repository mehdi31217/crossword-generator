// Legend chapter images for the World Map card collection.
//
// PRIMARY SOURCE — local assets under `public/images/legends/`, mirrored from
// Wikimedia Commons (`public/images/legends/CREDITS.md` lists the source page of
// every file). These used to be hot-linked to upload.wikimedia.org, which broke
// the collection: opening the gallery fires ~100 image requests at once and
// Commons answers HTTP 429 ("Too many requests"), so cards came up blank.
// Serving them from the app also keeps the game fully offline-capable.
//
// To swap an image, drop a replacement at `public/images/legends/<chapterId>.jpg`
// — no component code changes needed.

export const LEGEND_CHAPTER_IMAGES: Record<string, string> = {
  // ── Diego Maradona ──────────────────────────────────────────────
  maradona_villa: '/images/legends/maradona_villa.jpg',
  maradona_debut: '/images/legends/maradona_debut.jpg',
  maradona_barcelona: '/images/legends/maradona_barcelona.jpg',
  maradona_napoli: '/images/legends/maradona_napoli.jpg',
  maradona_1986: '/images/legends/maradona_1986.jpg',
  maradona_legacy: '/images/legends/maradona_legacy.jpg',
  // ── Lionel Messi ────────────────────────────────────────────────
  messi_rosario: '/images/legends/messi_rosario.jpg',
  messi_napkin: '/images/legends/messi_napkin.jpg',
  messi_number10: '/images/legends/messi_number10.jpg',
  messi_91goals: '/images/legends/messi_91goals.jpg',
  messi_copa: '/images/legends/messi_copa.jpg',
  messi_worldcup: '/images/legends/messi_worldcup.jpg',
  messi_miami: '/images/legends/messi_miami.jpg',
  // ── Cristiano Ronaldo ───────────────────────────────────────────
  // NOTE: these were previously pointing at Ronaldo Nazário (the Brazilian
  // "Ronaldo") photos — a mix-up with the other Ronaldo legend. Fixed to
  // show Cristiano himself. No free Sporting/childhood photos exist on
  // Commons, so the two earliest chapters use the youngest available shots.
  ronaldo_madeira: '/images/legends/ronaldo_madeira.jpg',
  ronaldo_sporting: '/images/legends/ronaldo_sporting.jpg',
  ronaldo_united: '/images/legends/ronaldo_united.jpg',
  ronaldo_real: '/images/legends/ronaldo_real.jpg',
  ronaldo_euro: '/images/legends/ronaldo_euro.jpg',
  ronaldo_nasr: '/images/legends/ronaldo_nasr.jpg',
  // ── Pelé ────────────────────────────────────────────────────────
  pele_bauru: '/images/legends/pele_bauru.jpg',
  pele_santos: '/images/legends/pele_santos.jpg',
  pele_1958: '/images/legends/pele_1958.jpg',
  pele_triple: '/images/legends/pele_triple.jpg',
  pele_rei: '/images/legends/pele_rei.jpg',
  // ── Zinedine Zidane ─────────────────────────────────────────────
  zidane_marseille: '/images/legends/zidane_marseille.jpg',
  zidane_juventus: '/images/legends/zidane_juventus.jpg',
  zidane_1998: '/images/legends/zidane_1998.jpg',
  zidane_galacticos: '/images/legends/zidane_galacticos.jpg',
  zidane_coach: '/images/legends/zidane_coach.jpg',
  // ── Johan Cruyff ────────────────────────────────────────────────
  cruyff_betondorp: '/images/legends/cruyff_betondorp.jpg',
  cruyff_ajax: '/images/legends/cruyff_ajax.jpg',
  cruyff_barcelona: '/images/legends/cruyff_barcelona.jpg',
  cruyff_dreamteam: '/images/legends/cruyff_dreamteam.jpg',
  // ── Franz Beckenbauer ───────────────────────────────────────────
  beckenbauer_munich: '/images/legends/beckenbauer_munich.jpg',
  beckenbauer_bayern: '/images/legends/beckenbauer_bayern.jpg',
  beckenbauer_1974: '/images/legends/beckenbauer_1974.jpg',
  beckenbauer_coach: '/images/legends/beckenbauer_coach.jpg',
  // ── Ronaldinho ──────────────────────────────────────────────────
  ronaldinho_porto_alegre: '/images/legends/ronaldinho_porto_alegre.jpg',
  ronaldinho_gremio_psg: '/images/legends/ronaldinho_gremio_psg.jpg',
  ronaldinho_barcelona: '/images/legends/ronaldinho_barcelona.jpg',
  ronaldinho_samba: '/images/legends/ronaldinho_samba.jpg',
  // ── Ronaldo Nazário ─────────────────────────────────────────────
  // Commons has no free pre-2002 photos of "O Fenômeno", so the two
  // earliest chapters use the closest available real photos of him
  // (previously they showed museum jerseys / a trophy instead).
  ronaldo9_cruzeiro: '/images/legends/ronaldo9_cruzeiro.jpg',
  ronaldo9_europe: '/images/legends/ronaldo9_europe.jpg',
  ronaldo9_return: '/images/legends/ronaldo9_return.jpg',
  ronaldo9_legacy: '/images/legends/ronaldo9_legacy.jpg',
  // ── Paolo Maldini ───────────────────────────────────────────────
  maldini_debut: '/images/legends/maldini_debut.jpg',
  maldini_sacchi: '/images/legends/maldini_sacchi.jpg',
  maldini_captain: '/images/legends/maldini_captain.jpg',
  maldini_legacy: '/images/legends/maldini_legacy.jpg',
  // ── Eusébio ─────────────────────────────────────────────────────
  eusebio_mozambique: '/images/legends/eusebio_mozambique.jpg',
  eusebio_benfica: '/images/legends/eusebio_benfica.jpg',
  eusebio_1966: '/images/legends/eusebio_1966.jpg',
  eusebio_legacy: '/images/legends/eusebio_legacy.jpg',
  // ── Ferenc Puskás ───────────────────────────────────────────────
  puskas_budapest: '/images/legends/puskas_budapest.jpg',
  puskas_honved: '/images/legends/puskas_honved.jpg',
  puskas_1954: '/images/legends/puskas_1954.jpg',
  puskas_real: '/images/legends/puskas_real.jpg',
  // ── Lev Yashin ──────────────────────────────────────────────────
  yashin_moscow: '/images/legends/yashin_moscow.jpg',
  yashin_dynamo: '/images/legends/yashin_dynamo.jpg',
  yashin_ballon: '/images/legends/yashin_ballon.jpg',
  yashin_legacy: '/images/legends/yashin_legacy.jpg',
  // ── George Best ─────────────────────────────────────────────────
  best_belfast: '/images/legends/best_belfast.jpg',
  best_united: '/images/legends/best_united.jpg',
  best_twilight: '/images/legends/best_twilight.jpg',
  best_legacy: '/images/legends/best_legacy.jpg',
  // ── Michel Platini ──────────────────────────────────────────────
  platini_joeuf: '/images/legends/platini_joeuf.jpg',
  platini_juve: '/images/legends/platini_juve.jpg',
  platini_euro84: '/images/legends/platini_euro84.jpg',
  platini_legacy: '/images/legends/platini_legacy.jpg',
  // ── Neymar ──────────────────────────────────────────────────────
  neymar_santos: '/images/legends/neymar_santos.jpg',
  neymar_santos_star: '/images/legends/neymar_santos_star.jpg',
  neymar_barcelona: '/images/legends/neymar_barcelona.jpg',
  neymar_psg: '/images/legends/neymar_psg.jpg',
  // ── Kylian Mbappé ───────────────────────────────────────────────
  mbappe_bondy: '/images/legends/mbappe_bondy.jpg',
  mbappe_monaco: '/images/legends/mbappe_monaco.jpg',
  mbappe_2018: '/images/legends/mbappe_2018.jpg',
  mbappe_real: '/images/legends/mbappe_real.jpg',
  // ── Erling Haaland ──────────────────────────────────────────────
  haaland_bryne: '/images/legends/haaland_bryne.jpg',
  haaland_salzburg: '/images/legends/haaland_salzburg.jpg',
  haaland_dortmund: '/images/legends/haaland_dortmund.jpg',
  haaland_city: '/images/legends/haaland_city.jpg',
  // ── Kevin De Bruyne ─────────────────────────────────────────────
  debruyne_genk: '/images/legends/debruyne_genk.jpg',
  debruyne_chelsea: '/images/legends/debruyne_chelsea.jpg',
  debruyne_city: '/images/legends/debruyne_city.jpg',
  debruyne_belgium: '/images/legends/debruyne_belgium.jpg',
  // ── Luka Modrić ─────────────────────────────────────────────────
  modric_zadar: '/images/legends/modric_zadar.jpg',
  modric_dinamo: '/images/legends/modric_dinamo.jpg',
  modric_real: '/images/legends/modric_real.jpg',
  modric_legacy: '/images/legends/modric_legacy.jpg',
  // ── Mohamed Salah ───────────────────────────────────────────────
  salah_nagrig: '/images/legends/salah_nagrig.jpg',
  salah_basel: '/images/legends/salah_basel.jpg',
  salah_roma: '/images/legends/salah_roma.jpg',
  salah_liverpool: '/images/legends/salah_liverpool.jpg',
  // ── Robert Lewandowski ──────────────────────────────────────────
  lewandowski_warsaw: '/images/legends/lewandowski_warsaw.jpg',
  lewandowski_dortmund: '/images/legends/lewandowski_dortmund.jpg',
  lewandowski_bayern: '/images/legends/lewandowski_bayern.jpg',
  lewandowski_barca: '/images/legends/lewandowski_barca.jpg',
  // ── Andrés Iniesta ──────────────────────────────────────────────
  iniesta_fuentealbilla: '/images/legends/iniesta_fuentealbilla.jpg',
  iniesta_barca: '/images/legends/iniesta_barca.jpg',
  iniesta_2010: '/images/legends/iniesta_2010.jpg',
  iniesta_legacy: '/images/legends/iniesta_legacy.jpg',
  // ── Son Heung-min ───────────────────────────────────────────────
  son_chuncheon: '/images/legends/son_chuncheon.jpg',
  son_hamburg: '/images/legends/son_hamburg.jpg',
  son_leverkusen: '/images/legends/son_leverkusen.jpg',
  son_tottenham: '/images/legends/son_tottenham.jpg',
  // ── Virgil van Dijk ─────────────────────────────────────────────
  vandijk_breda: '/images/legends/vandijk_breda.jpg',
  vandijk_celtic: '/images/legends/vandijk_celtic.jpg',
  vandijk_southampton: '/images/legends/vandijk_southampton.jpg',
  vandijk_liverpool: '/images/legends/vandijk_liverpool.jpg',};

// FALLBACK SOURCE — the original Commons URL for each chapter, used by
// `LegendCard` only when the mirrored local file is missing or unreadable.
// Keeping it here means a gap in the mirror degrades to "slightly slower photo"
// rather than "no photo". Delete an entry once its local file is guaranteed.

export const LEGEND_CHAPTER_REMOTE_FALLBACK: Record<string, string> = {
  maradona_villa: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Maradona_en_el_juvenil_1979.jpg',
  maradona_debut: 'https://upload.wikimedia.org/wikipedia/commons/d/dd/Maradona_fiesta_juvenil_1979.jpg',
  maradona_barcelona: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Maradona-Mundial_86_con_la_copa.JPG/960px-Maradona-Mundial_86_con_la_copa.JPG',
  maradona_napoli: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Maradona-Mundial_86_con_la_copa.JPG/960px-Maradona-Mundial_86_con_la_copa.JPG',
  maradona_1986: 'https://upload.wikimedia.org/wikipedia/commons/8/88/Maradona_1986_vs_italy.jpg',
  maradona_legacy: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Maradona-Mundial_86_con_la_copa.JPG/960px-Maradona-Mundial_86_con_la_copa.JPG',
  messi_rosario: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Leo_messi_barce_2005.jpg/960px-Leo_messi_barce_2005.jpg',
  messi_napkin: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Leo_messi_barce_2005.jpg/960px-Leo_messi_barce_2005.jpg',
  messi_number10: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Lionel_Messi_vs_Valladolid.jpg',
  messi_91goals: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Lionel_Messi_20180626.jpg',
  messi_copa: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Argentina_vs_mexico_messi_vs_erick_gutierrez_%28cropped%29.jpg',
  messi_worldcup: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Argentina_vs_mexico_messi_vs_erick_gutierrez_%28cropped%29.jpg',
  messi_miami: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Lionel_Messi_20180626.jpg',
  ronaldo_madeira: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Cristiano_Ronaldo_%28links_unten%29_im_EM-Halbfinale_gegen_die_Niederlande_%28cropped%29.jpg',
  ronaldo_sporting: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Ronaldo_-_Manchester_United_vs_Chelsea.jpg/960px-Ronaldo_-_Manchester_United_vs_Chelsea.jpg',
  ronaldo_united: 'https://upload.wikimedia.org/wikipedia/commons/7/71/Cristiano_Ronaldo_of_Manchester_United%2C_November_5%2C_2008.jpg',
  ronaldo_real: 'https://upload.wikimedia.org/wikipedia/commons/a/a1/Ronaldo_vs_Ludogorets_%2851101071755%29_%28Ronaldo_cropped%29.jpg',
  ronaldo_euro: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Cristiano_Ronaldo_Euro_2016.jpg/960px-Cristiano_Ronaldo_Euro_2016.jpg',
  ronaldo_nasr: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Cristiano_Ronaldo_playing_for_Al_Nassr_FC_against_Persepolis%2C_September_2023_%28cropped%29.jpg',
  pele_bauru: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Rei_Pel%C3%A933.JPG',
  pele_santos: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Pel%C3%A9_goal_1958_WC_final.jpg/960px-Pel%C3%A9_goal_1958_WC_final.jpg',
  pele_1958: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Pel%C3%A9_goal_1958_WC_final.jpg/960px-Pel%C3%A9_goal_1958_WC_final.jpg',
  pele_triple: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Pele_con_brasil_%28cropped%29.jpg',
  pele_rei: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Rei_Pel%C3%A933.JPG',
  zidane_marseille: 'https://upload.wikimedia.org/wikipedia/commons/f/f3/Zinedine_Zidane_by_Tasnim_03.jpg',
  zidane_juventus: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Zinedine_zidane_wcf_2006.jpg/960px-Zinedine_zidane_wcf_2006.jpg',
  zidane_1998: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Zinedine_zidane_wcf_2006.jpg/960px-Zinedine_zidane_wcf_2006.jpg',
  zidane_galacticos: 'https://upload.wikimedia.org/wikipedia/commons/f/f3/Zinedine_Zidane_by_Tasnim_03.jpg',
  zidane_coach: 'https://upload.wikimedia.org/wikipedia/commons/f/f3/Zinedine_Zidane_by_Tasnim_03.jpg',
  cruyff_betondorp: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Ajax_tegen_Anderlecht._Johan_Cruyff_gehuldigd_als_voetballer_van_het_jaar._Cruyf%2C_Bestanddeelnr_920-5736.jpg/960px-Ajax_tegen_Anderlecht._Johan_Cruyff_gehuldigd_als_voetballer_van_het_jaar._Cruyf%2C_Bestanddeelnr_920-5736.jpg',
  cruyff_ajax: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Johan_Cruyff_1971c.jpg/960px-Johan_Cruyff_1971c.jpg',
  cruyff_barcelona: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Johan_Cruyff_1974c.jpg/960px-Johan_Cruyff_1974c.jpg',
  cruyff_dreamteam: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Johan_Cruijff_%28Cruyff%29.jpg/960px-Johan_Cruijff_%28Cruyff%29.jpg',
  beckenbauer_munich: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Young_Franz_Beckenbauer_before_1966_Football_World_Cup.jpg',
  beckenbauer_bayern: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Franz_Beckenbauer_1972.jpg/960px-Franz_Beckenbauer_1972.jpg',
  beckenbauer_1974: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Finale_wereldkampioenschap_voetbal_1974_in_Munchen%2C_West_Duitsland_tegen_Nederland_2-1%3B_Neeskens%2C_Beckenbauer%2C_Rep_en_Breitner.jpg/960px-Finale_wereldkampioenschap_voetbal_1974_in_Munchen%2C_West_Duitsland_tegen_Nederland_2-1%3B_Neeskens%2C_Beckenbauer%2C_Rep_en_Breitner.jpg',
  beckenbauer_coach: 'https://upload.wikimedia.org/wikipedia/commons/1/17/Bundesarchiv_Bild_183-1990-1127-023%2C_Leipzig%2C_Bambi-Verleihung%2C_Franz_Beckenbauer_%28cropped%29.jpg',
  ronaldinho_porto_alegre: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Ronaldinho.jpg',
  ronaldinho_gremio_psg: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Ronaldinho_corner.jpg',
  ronaldinho_barcelona: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Ronaldinho061115.jpg/960px-Ronaldinho061115.jpg',
  ronaldinho_samba: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Ronaldinho_Ga%C3%BAcho_2016.jpg/960px-Ronaldinho_Ga%C3%BAcho_2016.jpg',
  ronaldo9_cruzeiro: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Salvaronaldo.jpg/960px-Salvaronaldo.jpg',
  ronaldo9_europe: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Ronaldo_Pallone_d%27oro_1997.jpg/960px-Ronaldo_Pallone_d%27oro_1997.jpg',
  ronaldo9_return: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Ronaldo_2002_cropped.jpg',
  ronaldo9_legacy: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Ronaldo_em_campo.jpg',
  maldini_debut: 'https://upload.wikimedia.org/wikipedia/commons/8/8f/Roberto_Mancini_e_Paolo_Maldini_Barletta%2C_1998.jpg',
  maldini_sacchi: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/A.C._Milan_lifting_the_European_Cup_after_winning_the_2002%E2%80%9303_UEFA_Champions_League_-_20030528.jpg/960px-A.C._Milan_lifting_the_European_Cup_after_winning_the_2002%E2%80%9303_UEFA_Champions_League_-_20030528.jpg',
  maldini_captain: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Maldini2008.JPG',
  maldini_legacy: 'https://upload.wikimedia.org/wikipedia/commons/0/0a/Paolo_Maldini_AC_Milan_Technical_director_2018.jpg',
  eusebio_mozambique: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Eusebio_%281963%29.jpg/960px-Eusebio_%281963%29.jpg',
  eusebio_benfica: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Eusebio_%281963_version2%29.jpg/960px-Eusebio_%281963_version2%29.jpg',
  eusebio_1966: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Eusebio1965.jpg/960px-Eusebio1965.jpg',
  eusebio_legacy: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Eus%C3%A9bio_1972.jpg/960px-Eus%C3%A9bio_1972.jpg',
  puskas_budapest: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Pusk%C3%A1s_fortepan_54983.jpg/960px-Pusk%C3%A1s_fortepan_54983.jpg',
  puskas_honved: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Az_Aranycsapat._L%C3%B3r%C3%A1nt_Gyula%2C_Buz%C3%A1nszky_Jen%C5%91%2C_Hidegk%C3%BAti_N%C3%A1ndor%2C_Kocsis_S%C3%A1ndor%2C_Zakari%C3%A1s_J%C3%B3zsef%2C_Czibor_Zolt%C3%A1n%2C_Bozsik_J%C3%B3zsef%2C_Budai_II_L%C3%A1szl%C3%B3%2C_guggol-_Lantos_Mih%C3%A1ly%2C_Pusk%C3%A1s_Ferenc%2C_Grosics_Gyula._Fortepan_6671.jpg/960px-thumbnail.jpg',
  puskas_1954: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Les_deux_capitaines_de_la_finale_de_Coupe_du_monde_de_football_1954_%28G._Walter%2C_D._Puskas%2C_arbitre_Orlandini%29.jpg',
  puskas_real: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/1961%E2%80%9362_European_Cup_-_Juventus_v_Real_Madrid_-_Pusk%C3%A1s%2C_Gento_and_Araquist%C3%A1in.jpg/960px-1961%E2%80%9362_European_Cup_-_Juventus_v_Real_Madrid_-_Pusk%C3%A1s%2C_Gento_and_Araquist%C3%A1in.jpg',
  yashin_moscow: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Lev_Yashin%2C_fails_to_stop_a_goal_during_the_soccer_match_agains_Israel%2C_1958_D448-092.jpg/960px-Lev_Yashin%2C_fails_to_stop_a_goal_during_the_soccer_match_agains_Israel%2C_1958_D448-092.jpg',
  yashin_dynamo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Lev_Yashin_1960.jpg/960px-Lev_Yashin_1960.jpg',
  yashin_ballon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Lev_Yashin_1962.jpg/960px-Lev_Yashin_1962.jpg',
  yashin_legacy: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Lev_Yashin_1966.jpg',
  best_belfast: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Manu-Finland-1965.jpg/960px-Manu-Finland-1965.jpg',
  best_united: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Manu-Finland-1965.jpg/960px-Manu-Finland-1965.jpg',
  best_twilight: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/George_Best_%281976%29.jpg/960px-George_Best_%281976%29.jpg',
  best_legacy: 'https://upload.wikimedia.org/wikipedia/commons/1/1f/GeorgeBest.jpg',
  platini_joeuf: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Michel_Platini_en_1975.jpg',
  platini_juve: 'https://upload.wikimedia.org/wikipedia/commons/0/00/Platini_entrevista.jpg',
  platini_euro84: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Platini_vs_canada.jpg/960px-Platini_vs_canada.jpg',
  platini_legacy: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Michel_Platini_2008.jpg/960px-Michel_Platini_2008.jpg',
  neymar_santos: 'https://upload.wikimedia.org/wikipedia/commons/6/62/Neymar.jpg',
  neymar_santos_star: 'https://upload.wikimedia.org/wikipedia/commons/8/8b/Neymar_Santos_2011.jpg',
  neymar_barcelona: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Neymar_Barcelona_presentation_1.jpg/960px-Neymar_Barcelona_presentation_1.jpg',
  neymar_psg: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Neymar_PSG.jpg/960px-Neymar_PSG.jpg',
  mbappe_bondy: 'https://upload.wikimedia.org/wikipedia/commons/f/f3/Kylian_Mbapp%C3%A9_-_2017-05-06.jpg',
  mbappe_monaco: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Kylian_Mbappe_2017.jpg/960px-Kylian_Mbappe_2017.jpg',
  mbappe_2018: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Kylian_Mbapp%C3%A9_2018.jpg',
  mbappe_real: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Kylian_Mbappe_at_Real_Madrid%27s_game_versus_Juventus_Turin_on_22_October_2025.jpeg',
  haaland_bryne: 'https://upload.wikimedia.org/wikipedia/commons/e/ee/Molde-Zenit_%282%29_Erling_Braut_H%C3%A5land_2018-8-30.jpg',
  haaland_salzburg: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/FC_RB_Salzburg_gegen_CSKA_Sofia_%28Testspiel_3._Juli_2019%29_14.jpg/960px-FC_RB_Salzburg_gegen_CSKA_Sofia_%28Testspiel_3._Juli_2019%29_14.jpg',
  haaland_dortmund: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Erling_Haaland_2020_%28cropped%29.jpg',
  haaland_city: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Erling_Haaland_2023.jpg/960px-Erling_Haaland_2023.jpg',
  debruyne_genk: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Kevin_De_Bruyne_at_Samsung.jpg/960px-Kevin_De_Bruyne_at_Samsung.jpg',
  debruyne_chelsea: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Kevin_De_Bruyne_vs_USA.jpg/960px-Kevin_De_Bruyne_vs_USA.jpg',
  debruyne_city: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Kevin_de_Bruyne_2016-12-26.jpg/960px-Kevin_de_Bruyne_2016-12-26.jpg',
  debruyne_belgium: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Kevin_De_Bruyne_celebrating_Belgium%27s_2%E2%80%931_win_over_Brazil.jpg/960px-Kevin_De_Bruyne_celebrating_Belgium%27s_2%E2%80%931_win_over_Brazil.jpg',
  modric_zadar: 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Luka_Modri%C4%87_10052008.jpg',
  modric_dinamo: 'https://upload.wikimedia.org/wikipedia/commons/1/1f/Luka_Modri%C4%87_2010.jpg',
  modric_real: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Luka_Modri%C4%87_Real_Madrid.jpg/960px-Luka_Modri%C4%87_Real_Madrid.jpg',
  modric_legacy: 'https://upload.wikimedia.org/wikipedia/commons/5/55/Luka_Modri%C4%87_in_2018.jpg',
  salah_nagrig: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Mohamed_salah.jpg/960px-Mohamed_salah.jpg',
  salah_basel: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Mohamed_Salah.JPG/960px-Mohamed_Salah.JPG',
  salah_roma: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Mohamed_Salah_2015.jpg',
  salah_liverpool: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Mo_Salah_2018.jpg/960px-Mo_Salah_2018.jpg',
  lewandowski_warsaw: 'https://upload.wikimedia.org/wikipedia/commons/8/88/Robert_Lewandowski_2008_profil.jpg',
  lewandowski_dortmund: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Robert_Lewandowski_2011.jpg',
  lewandowski_bayern: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Robert_Lewandowski-abr_2016.jpg/960px-Robert_Lewandowski-abr_2016.jpg',
  lewandowski_barca: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Robert_Lewandowski_%282025%29.png/960px-Robert_Lewandowski_%282025%29.png',
  iniesta_fuentealbilla: 'https://upload.wikimedia.org/wikipedia/commons/e/ed/Andr%C3%A9s_Iniesta_21dec2006.jpg',
  iniesta_barca: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Andr%C3%A9s_Iniesta_2011.jpg/960px-Andr%C3%A9s_Iniesta_2011.jpg',
  iniesta_2010: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Andres_Iniesta.jpg/960px-Andres_Iniesta.jpg',
  iniesta_legacy: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Andres_Iniesta_2018_%28edited%29.jpg/960px-Andres_Iniesta_2018_%28edited%29.jpg',
  son_chuncheon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Son_Heung-Min.jpg/960px-Son_Heung-Min.jpg',
  son_hamburg: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Son_Heung-Min.jpg/960px-Son_Heung-Min.jpg',
  son_leverkusen: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/BFA_Son_Heung_Min_2014.jpg',
  son_tottenham: 'https://upload.wikimedia.org/wikipedia/commons/f/f4/Son_Heung-min_2016.jpg',
  vandijk_breda: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Virgilvandijk.jpg',
  vandijk_celtic: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Virgil_van_Dijk_2015.jpg/960px-Virgil_van_Dijk_2015.jpg',
  vandijk_southampton: 'https://upload.wikimedia.org/wikipedia/commons/5/5d/20160604_AUT_NED_8876_%28cropped%29.jpg',
  vandijk_liverpool: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Liverpool_vs._Chelsea%2C_UEFA_Super_Cup_2019-08-14_33_%28cropped%29.jpg',
};

export function getChapterBgImage(chapterId: string): string | null {
  return LEGEND_CHAPTER_IMAGES[chapterId] || null;
}

export const LEGEND_PORTRAIT_IMAGES: Record<string, string> = {
  messi: '/images/legends/messi_91goals.jpg',
  maradona: '/images/legends/maradona_barcelona.jpg',
  ronaldo: '/images/legends/ronaldo_real.jpg',
  pele: '/images/legends/pele_triple.jpg',
  zidane: '/images/legends/zidane_galacticos.jpg',
  cruyff: '/images/legends/cruyff_ajax.jpg',
  beckenbauer: '/images/legends/beckenbauer_bayern.jpg',
  ronaldinho: '/images/legends/ronaldinho_samba.jpg',
  ronaldo9: '/images/legends/ronaldo9_return.jpg',
  maldini: '/images/legends/maldini_captain.jpg',
  eusebio: '/images/legends/eusebio_1966.jpg',
  puskas: '/images/legends/puskas_budapest.jpg',
  yashin: '/images/legends/yashin_ballon.jpg',
  best: '/images/legends/best_legacy.jpg',
  platini: '/images/legends/platini_euro84.jpg',
  neymar: '/images/legends/neymar_barcelona.jpg',
  mbappe: '/images/legends/mbappe_2018.jpg',
  haaland: '/images/legends/haaland_dortmund.jpg',
  debruyne: '/images/legends/debruyne_city.jpg',
  modric: '/images/legends/modric_real.jpg',
  salah: '/images/legends/salah_liverpool.jpg',
  lewandowski: '/images/legends/lewandowski_bayern.jpg',
  iniesta: '/images/legends/iniesta_2010.jpg',
  son: '/images/legends/son_tottenham.jpg',
  vandijk: '/images/legends/vandijk_liverpool.jpg',
};

export function getLegendPortraitImage(legendId: string): string {
  return (
    LEGEND_PORTRAIT_IMAGES[legendId] ||
    LEGEND_CHAPTER_IMAGES[`${legendId}_legacy`] ||
    '/images/legends/messi_91goals.jpg'
  );
}

/**
 * Fallback gradient for when the Wikimedia image fails to load.
 * Maps each legend to a distinct dark gradient that matches their accent color.
 */
export function getChapterFallbackGradient(chapterId: string): string {
  const legend = chapterId.split('_')[0]; // e.g. "maradona", "messi"
  const gradients: Record<string, string> = {
    // ── Original 5 legends ──
    maradona:    'linear-gradient(135deg, #1a1a2e 0%, #f59e0b33 100%)',
    messi:       'linear-gradient(135deg, #0f172a 0%, #3b82f666 100%)',
    ronaldo:     'linear-gradient(135deg, #1a1a2e 0%, #dc262633 100%)',
    pele:        'linear-gradient(135deg, #0f172a 0%, #10b98133 100%)',
    zidane:      'linear-gradient(135deg, #1a1a2e 0%, #6366f133 100%)',
    // ── 10 classic legends ──
    cruyff:      'linear-gradient(135deg, #1a1a2e 0%, #f9731633 100%)',
    beckenbauer: 'linear-gradient(135deg, #0f172a 0%, #64748b33 100%)',
    ronaldinho:  'linear-gradient(135deg, #1a1a2e 0%, #facc1533 100%)',
    ronaldo9:    'linear-gradient(135deg, #0f172a 0%, #0ea5e933 100%)',
    maldini:     'linear-gradient(135deg, #1a1a2e 0%, #0284c733 100%)',
    eusebio:     'linear-gradient(135deg, #0f172a 0%, #b91c1c33 100%)',
    puskas:      'linear-gradient(135deg, #1a1a2e 0%, #16a34a33 100%)',
    yashin:      'linear-gradient(135deg, #0f172a 0%, #47556933 100%)',
    best:        'linear-gradient(135deg, #1a1a2e 0%, #7c3aed33 100%)',
    platini:     'linear-gradient(135deg, #0f172a 0%, #2563eb33 100%)',
    // ── 10 modern legends ──
    neymar:      'linear-gradient(135deg, #1a1a2e 0%, #10b98133 100%)',
    mbappe:      'linear-gradient(135deg, #0f172a 0%, #1d4ed833 100%)',
    haaland:     'linear-gradient(135deg, #1a1a2e 0%, #ef444433 100%)',
    debruyne:    'linear-gradient(135deg, #0f172a 0%, #eab30833 100%)',
    modric:      'linear-gradient(135deg, #1a1a2e 0%, #dc262633 100%)',
    salah:       'linear-gradient(135deg, #0f172a 0%, #0d948833 100%)',
    lewandowski: 'linear-gradient(135deg, #1a1a2e 0%, #e11d4833 100%)',
    iniesta:     'linear-gradient(135deg, #0f172a 0%, #f59e0b33 100%)',
    son:         'linear-gradient(135deg, #1a1a2e 0%, #db277733 100%)',
    vandijk:     'linear-gradient(135deg, #0f172a 0%, #ea580c33 100%)',
  };
  return gradients[legend] || 'linear-gradient(135deg, #0f172a 0%, #334155 100%)';
}

/**
 * Parsed chapter legend ID from chapter ID — used for gradient lookups.
 */
export function getChapterLegendId(chapterId: string): string {
  return chapterId.split('_')[0];
}

/**
 * React onError handler: hides the broken image element and shows the fallback instead.
 * Usage: onError={(e) => handleImgError(e, chapterId)}
 */
export function handleImgError(e: React.SyntheticEvent<HTMLImageElement | HTMLDivElement, Event>, chapterId: string) {
  const target = e.currentTarget;
  // For <img> elements: hide the img, create or show fallback
  if (target.tagName === 'IMG') {
    target.style.display = 'none';
    // Find the fallback sibling (div.gradient-fallback) and show it
    const parent = target.parentElement;
    if (parent) {
      const fallback = parent.querySelector('.gradient-fallback') as HTMLElement;
      if (fallback) {
        fallback.style.display = 'flex';
      }
    }
  } else {
    // For <div> elements (CSS background): remove background image, use fallback color
    target.style.backgroundImage = 'none';
    target.style.backgroundColor = '#0f172a';
  }
}
