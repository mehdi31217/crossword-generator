#!/usr/bin/env node
/**
 * Download real Persian miniature images from Wikimedia Commons
 * Matches them to specific chapters in the game
 * Uses 6-second delays between requests to avoid rate limiting
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const SCENES_DIR = path.join(__dirname, '..', 'public', 'images', 'scenes');

// All target images with their Wikimedia filenames and target local filenames
const TARGETS = [
  // ===== ROSTAM 7 (Haft Khan) =====
  {
    file: 'Rakhsh Kills a Lion while Rustam Sleeps.jpg',
    saveAs: 'rostam7-khan1.jpg',
    chapter: 'rostam7-ch1',
    desc: 'Khan 1: Rakhsh kills the lion'
  },
  {
    file: 'Rustam Fights the Dragon (Rustam\'s Third Course), Folio from a Shahnama (Book of Kings) MET DP215910.jpg',
    saveAs: 'rostam7-khan3.jpg',
    chapter: 'rostam7-ch3',
    desc: 'Khan 3: Rustam fights the dragon'
  },
  {
    file: 'An illustrated leaf from a manuscript of Firdausi\u2019s Shahnameh; Rustam killing the White Div, Persia, Shiraz, Safavid, circa 1560-80.jpg',
    saveAs: 'rostam7-khan7.jpg',
    chapter: 'rostam7-ch7',
    desc: 'Khan 7: Rustam kills the White Div'
  },
  {
    file: 'Rustam Overpowers the King of Hamavaran, Folio from a Shahnama (Book of Kings) MET 18905.jpg',
    saveAs: 'rostam7-khan5.jpg',
    chapter: 'rostam7-ch5',
    desc: 'Khan 5: Rustam overpowers Olad'
  },
  {
    file: 'Rustam Fighting Ashkabus, Folio from a Shahnama (Book of Kings) MET DP215761.jpg',
    saveAs: 'rostam7-khan6.jpg',
    chapter: 'rostam7-ch6',
    desc: 'Khan 6: Rustam fights Arzhang'
  },
  {
    file: 'Rustam Lassos Rakhsh, Folio from a Shahnama (Book of Kings) of Firdausi MET DP108555.jpg',
    saveAs: 'rostam7-khan2.jpg',
    chapter: 'rostam7-ch2',
    desc: 'Khan 2: Rustam in the desert'
  },
  // Additional general Rostam images
  {
    file: 'Rostam and the White Div from Baysanghar Shahnameh.jpg',
    saveAs: 'rostam7-khan7-alt.jpg',
    chapter: 'rostam7-ch7-alt',
    desc: 'Khan 7 alternate: Rostam & White Div'
  },

  // ===== ROSTAM & SOHRAB =====
  {
    file: 'Tahminah.jpg',
    saveAs: 'sohrab-ch3.jpg',
    chapter: 'sohrab-ch3',
    desc: 'Sohrab 3: Tahmineh'
  },
  {
    file: 'Rostam and Sohrab from the Windsor Shahnameh.png',
    saveAs: 'sohrab-ch6.jpg',
    chapter: 'sohrab-ch6',
    desc: 'Sohrab 6: Confrontation'
  },
  {
    file: 'Firdawsi - Rustam Mortally Wounds Suhrab - Walters W600115A - Full Page.jpg',
    saveAs: 'sohrab-ch7.jpg',
    chapter: 'sohrab-ch7',
    desc: 'Sohrab 7: Tragedy'
  },
  {
    file: 'The slaying of Sohrab by Rostam; from the Shahnameh of Ibrahim Sultan.jpg',
    saveAs: 'sohrab-ch7-alt.jpg',
    chapter: 'sohrab-ch7-alt',
    desc: 'Sohrab 7 alternate: Slaying'
  },
  {
    file: '"Birth of Rustam", Folio from a Shahnama (Book of Kings) MET sf65-7-1r.jpg',
    saveAs: 'sohrab-ch4.jpg',
    chapter: 'sohrab-ch4',
    desc: 'Sohrab 4: Birth'
  },
  {
    file: 'Sohrab and Gordafarid by Joseph Rotter.jpg',
    saveAs: 'sohrab-ch5.jpg',
    chapter: 'sohrab-ch5',
    desc: 'Sohrab 5: Gordafarid'
  },
  {
    file: 'Suhrab (The Shahnama of Shah Tahmasp).png',
    saveAs: 'sohrab-ch5-alt.jpg',
    chapter: 'sohrab-ch5-alt',
    desc: 'Sohrab portrait from Tahmasp'
  },
  {
    file: 'Sohrab fights Gordafarid.jpg',
    saveAs: 'sohrab-ch5-alt2.jpg',
    chapter: 'sohrab-ch5-alt2',
    desc: 'Sohrab fights Gordafarid'
  },
  {
    file: 'Rostam and Sohrab by Joseph Rotter.jpg',
    saveAs: 'sohrab-ch6-alt.jpg',
    chapter: 'sohrab-ch6-alt',
    desc: 'Rostam and Sohrab fighting'
  },

  // ===== ROSTAM & AFRASIAB =====
  {
    file: 'Rustam recovers Rakhsh from Afrasiyab\'s herd, illustrated folio (f.295r.) from The Shahnameh of Shah Tahmasp.jpg',
    saveAs: 'afrasiab-ch1.jpg',
    chapter: 'afrasiab-ch1',
    desc: 'Afrasiab 1: Rakhsh from Afrasiab herd'
  },
  {
    file: 'Battle between Kai Khusrau and Afrasiyab.jpg',
    saveAs: 'afrasiab-ch2.jpg',
    chapter: 'afrasiab-ch2',
    desc: 'Afrasiab 2: Kai Khusrau vs Afrasiyab'
  },
  {
    file: 'Rustam and the seven heroes fight the Turanians.jpg',
    saveAs: 'afrasiab-ch5.jpg',
    chapter: 'afrasiab-ch5',
    desc: 'Afrasiab 5: Seven heroes'
  },
  {
    file: 'Rustam lifts Afrasiab from his saddle by his belt (6124549855).jpg',
    saveAs: 'afrasiab-ch6.jpg',
    chapter: 'afrasiab-ch6',
    desc: 'Afrasiab 6: Rustam lifts Afrasiab'
  },
  {
    file: 'Siyavush plays polo before Afrasiyab (CBL Per 157.115 b, detail).jpg',
    saveAs: 'afrasiab-ch3.jpg',
    chapter: 'afrasiab-ch3',
    desc: 'Afrasiab 3: Siyavush before Afrasiyab'
  },
  {
    file: 'Afrasiyab (The Shahnama of Shah Tahmasp).png',
    saveAs: 'afrasiab-ch1-alt.jpg',
    chapter: 'afrasiab-ch1-alt',
    desc: 'Afrasiab portrait'
  },
  {
    file: 'Kay Khusraw Leads his Force against Afrasiyab and the Turanian Army (CBL In 64.13).jpg',
    saveAs: 'afrasiab-ch2-alt.jpg',
    chapter: 'afrasiab-ch2-alt',
    desc: 'Kay Khusraw vs Afrasiyab'
  },
  {
    file: 'Afrasiyab Executes Nauzar Wellcome L0068903.jpg',
    saveAs: 'afrasiab-ch4.jpg',
    chapter: 'afrasiab-ch4',
    desc: 'Afrasiyab executes Nauzar'
  },

  // ===== GENERAL / OTHER SCENES =====
  {
    file: "Shahnameh - The Div Akvan throws Rustam into the sea.jpg",
    saveAs: 'general-div-akvan.jpg',
    chapter: 'general',
    desc: 'Div Akvan throws Rustam into sea'
  },
  {
    file: "The White Div captures and blinds Kay Kavus.jpg",
    saveAs: 'general-white-div-kavus.jpg',
    chapter: 'general',
    desc: 'White Div blinds Kay Kavus'
  },
  {
    file: "Rustam shoots Shaghad through the tree, folio from Shahnameh, Iran, probably Shiraz, 1560-80 AD, opaque watercolour, ink, and gold on paper - Aga Khan Museum - Toronto, Canada - DSC06960.jpg",
    saveAs: 'general-rustam-shaghad.jpg',
    chapter: 'general',
    desc: 'Rustam shoots Shaghad'
  },
  {
    file: "Faramarz pursues the king of Kabul, illustrated folio (f.166v.) from the Shahnameh of Shah Tahmasp - 2014.jpg",
    saveAs: 'general-faramarz.jpg',
    chapter: 'general',
    desc: 'Faramarz pursues Kabul king'
  },
  {
    file: "Zal and the Simurgh, ink and opaque watercolor painting from Iran, 16th century, Honolulu Academy of Arts.JPG",
    saveAs: 'general-zal-simurgh.jpg',
    chapter: 'general',
    desc: 'Zal and the Simurgh'
  },
  {
    file: 'Rustam kills the dragon, folio from Shahnameh of Shah Ismail II, attrib. Sadegi (Beg), Iran, Tabriz, c. 1576 AD, view 1 - Aga Khan Museum - Toronto, Canada - DSC06935.jpg',
    saveAs: 'general-rustam-dragon-aga.jpg',
    chapter: 'general',
    desc: 'Rustam kills dragon (Aga Khan)'
  },
  {
    file: 'Rustam kicks back the rock hurled on him by Bahman, folio from Shahnameh, Iran, Shiraz, c. 1560-1580 AD, watercolour, ink, and gold on paper - Aga Khan Museum - Toronto, Canada - DSC06929.jpg',
    saveAs: 'general-rustam-bahman.jpg',
    chapter: 'general',
    desc: 'Rustam kicks back rock'
  },
  {
    file: 'The simurgh arrives to assist with the birth of Rustam.jpg',
    saveAs: 'general-simurgh-birth.jpg',
    chapter: 'general',
    desc: 'Simurgh at Rustam birth'
  },
  {
    file: 'RostamMournsSohrab.jpg',
    saveAs: 'general-rostam-mourns.jpg',
    chapter: 'general',
    desc: 'Rostam mourns Sohrab'
  },
  // Baysonghori Shahnameh general battle
  {
    file: "Baysonghori Shahnameh 6 The tyrant Zahhak is nailed to the walls of a cave in Mount Damavand.jpg",
    saveAs: 'general-zahhak.jpg',
    chapter: 'general',
    desc: 'Zahhak nailed to cave'
  },
  {
    file: 'Rustam Pursues Akvan, The Onager-Div, Folio from the Shahnameh (Book of Kings) of Shah Tahmasp.jpg',
    saveAs: 'general-rustam-akvan.jpg',
    chapter: 'general',
    desc: 'Rustam pursues Akvan Div'
  },
  {
    file: "Rustam Slaying the Dragon.jpg",
    saveAs: 'general-rustam-dragon-2.jpg',
    chapter: 'general',
    desc: 'Rustam slaying dragon (MET)'
  },
  {
    file: 'Name-ye Khosrovan bsb11180462 00358.jpg',
    saveAs: 'general-shahnameh-scene.jpg',
    chapter: 'general',
    desc: 'Shahnameh battle scene'
  },
  // Additional general scenes
  {
    file: 'Shahnameh illustration - IMJ B69-0570-cropped.jpg',
    saveAs: 'general-shahnameh-illustration.jpg',
    chapter: 'general',
    desc: 'Shahnameh illustration'
  },
];

function getFileUrl(filename) {
  return new Promise((resolve, reject) => {
    const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(filename)}&prop=imageinfo&iiprop=url&format=json&formatversion=2`;
    
    https.get(apiUrl, { headers: { 'User-Agent': 'CrosswordGen-App/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query.pages;
          if (pages && pages[0] && pages[0].imageinfo && pages[0].imageinfo[0]) {
            resolve(pages[0].imageinfo[0].url);
          } else {
            reject(new Error(`No URL found for ${filename}`));
          }
        } catch (e) {
          reject(new Error(`Parse error for ${filename}: ${e.message}`));
        }
      });
    }).on('error', reject);
  });
}

function downloadFile(url, savePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(savePath);
    https.get(url, { headers: { 'User-Agent': 'CrosswordGen-App/1.0' } }, (res) => {
      if (res.statusCode === 429) {
        reject(new Error('Rate limited (429)'));
        return;
      }
      if (res.statusCode === 404) {
        reject(new Error('Not found (404)'));
        return;
      }
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Follow redirect
        downloadFile(res.headers.location, savePath).then(resolve).catch(reject);
        return;
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        const stat = fs.statSync(savePath);
        if (stat.size === 0) {
          reject(new Error('Empty file downloaded'));
        } else {
          resolve(stat.size);
        }
      });
    }).on('error', (err) => {
      fs.unlink(savePath, () => {});
      reject(err);
    });
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  // Ensure scenes directory exists
  if (!fs.existsSync(SCENES_DIR)) {
    fs.mkdirSync(SCENES_DIR, { recursive: true });
  }

  const results = { success: [], skipped: [], failed: [] };

  for (let i = 0; i < TARGETS.length; i++) {
    const target = TARGETS[i];
    const savePath = path.join(SCENES_DIR, target.saveAs);
    
    // Skip if already downloaded
    if (fs.existsSync(savePath) && fs.statSync(savePath).size > 1000) {
      console.log(`[${i + 1}/${TARGETS.length}] SKIP ${target.saveAs} (already exists)`);
      results.skipped.push(target.saveAs);
      continue;
    }

    console.log(`[${i + 1}/${TARGETS.length}] FETCH ${target.file.substring(0, 60)}...`);
    
    try {
      const url = await getFileUrl(target.file);
      console.log(`  URL: ${url.substring(0, 80)}...`);
      
      // Wait before downloading (be respectful)
      await sleep(2000 + Math.random() * 1000);
      
      const size = await downloadFile(url, savePath);
      console.log(`  OK (${(size / 1024).toFixed(1)} KB) -> ${target.saveAs}`);
      results.success.push(target.saveAs);
    } catch (err) {
      console.log(`  FAIL: ${err.message}`);
      results.failed.push({ file: target.file, saveAs: target.saveAs, error: err.message });
    }

    // Wait between files (critical to avoid rate limiting)
    if (i < TARGETS.length - 1) {
      const delay = 6000 + Math.random() * 4000;
      console.log(`  Waiting ${(delay / 1000).toFixed(0)}s...`);
      await sleep(delay);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('RESULTS:');
  console.log(`  Success: ${results.success.length}`);
  console.log(`  Skipped: ${results.skipped.length}`);
  console.log(`  Failed:  ${results.failed.length}`);
  
  if (results.failed.length > 0) {
    console.log('\nFailed downloads:');
    results.failed.forEach(f => {
      console.log(`  - ${f.saveAs}: ${f.error}`);
    });
  }
}

main().catch(console.error);
