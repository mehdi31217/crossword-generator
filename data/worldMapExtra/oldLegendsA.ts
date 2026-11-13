import { WorldMapChapter } from '../../types';

// ─── JOHAN CRUYFF (هلند) ───────────────────────────────
// 4 فصل از زندگی معمار «فوتبال توتال»

export const CRUYFF_CHAPTERS: WorldMapChapter[] = [
  {
    id: 'cruyff_betondorp',
    legendId: 'cruyff',
    chapterIndex: 0,
    title: { fa: 'پسری از بتوندورپ', en: 'The Boy from Betondorp' },
    subtitle: { fa: 'زادگاه فوتبال توتال', en: 'Where Total Football Was Born' },
    story: {
      fa: `۲۵ آوریل ۱۹۴۷، در محله‌ی کارگریِ بتوندورپ در شرق آمستردام، هندریک یوهانس کرویف به دنیا آمد؛ پسری لاغر که پدرش هرمان، میوه‌فروشی کوچکی داشت و مادرش پت، در باشگاه آژاکس آشپزی می‌کرد.

یوهان از کودکی با توپ زندگی می‌کرد. در زمین خاکیِ کنار خانه، به‌جای دویدن دنبال توپ، همیشه یک قدم جلوتر از آن بود؛ انگار توپ به فرمان ذهنش حرکت می‌کرد. پدرش که عاشق فوتبال بود، هر شب برایش از بازی‌های بزرگ می‌گفت.

در دوازده سالگی، پدرش را از دست داد. ضربه‌ای سنگین که پسرک را زودتر از موعد بزرگ کرد. مادرش برای گذران زندگی سخت می‌کوشید و یوهان در همان سال‌ها به آکادمی آژاکس راه یافت؛ جایی که یک مربی سختگیر به نام یانی فان در فین او را زیر نظر گرفت و اولین‌بار به او یاد داد که «بازی را با مغز ببین، نه فقط با پا».`,
      en: `On April 25, 1947, in the working-class neighborhood of Betondorp in eastern Amsterdam, Hendrik Johannes Cruyff was born — a skinny boy whose father Herman ran a small fruit shop and whose mother Pet cooked at the Ajax club.

Johan lived with a ball from childhood. On the dirt pitch beside his home, instead of chasing the ball he was always one step ahead of it, as if it moved at the command of his mind. His father, who loved football, told him stories of great matches every night.

At twelve he lost his father — a heavy blow that made the boy grow up early. His mother worked hard to make ends meet, and that same year Johan entered the Ajax academy, where a strict coach named Jany van der Veen took him under his wing and first taught him to "see the game with your brain, not just your feet."`
    },
    victoryText: {
      fa: 'توپ را در زمین خاکی بتوندورپ می‌چرخانی و مردها با حیرت نگاه می‌کنند. پسرکی که پدرش را از دست داده، حالا در آکادمی آژاکس رؤیای بزرگی در سر دارد. یانی فان در فین لبخند می‌زند: این پسر فوتبال را از نو خواهد نوشت.',
      en: 'You spin the ball on the dirt pitch of Betondorp and grown men watch in awe. The boy who lost his father now carries a great dream at the Ajax academy. Jany van der Veen smiles: this boy will rewrite football.'
    },
    year: '1947-1964',
    words: [
      { word: 'آمستردام', clue: 'شهری که کرویف در محله شرقی آن به دنیا آمد' },
      { word: 'بتوندورپ', clue: 'نام محله کارگری زادگاه کرویف' },
      { word: 'توپ', clue: 'همراه همیشگی یوهان از کودکی' },
      { word: 'آژاکس', clue: 'باشگاهی که مادر کرویف در آشپزخانه‌اش کار می‌کرد' },
      { word: 'پدر', clue: 'هرمان؛ کسی که کرویف را در ۱۲ سالگی از دست داد' },
      { word: 'مادر', clue: 'پت؛ زنی که برای گذران زندگی سخت کوشید' },
      { word: 'خاکی', clue: 'جنس زمین بازی کنار خانه کرویف' },
      { word: 'مغز', clue: 'مربی گفت بازی را با این ببین، نه فقط با پا' },
      { word: 'آکادمی', clue: 'جایی که کرویف نوجوان زیر نظر فان در فین آموزش دید' },
      { word: 'میوه', clue: 'شغل پدر کرویف در مغازه کوچکشان' },
    ],
    bgEmoji: '🧠',
  },
  {
    id: 'cruyff_ajax',
    legendId: 'cruyff',
    chapterIndex: 1,
    title: { fa: 'شماره ۱۴ در آژاکس', en: 'Number 14 at Ajax' },
    subtitle: { fa: 'تولد فوتبال توتال', en: 'The Birth of Total Football' },
    story: {
      fa: `در ۱۵ اکتبر ۱۹۶۴، یوهان ۱۷ ساله اولین بازی رسمی‌اش را برای آژاکس انجام داد و همان شب گل پیروزی را زد. اما داستان واقعی از آن‌جا شروع شد که مربی مبتکر، رینوس میشل، به آژاکس آمد و با کرویف ایده‌ی تازه‌ای را ساختند: «فوتبال توتال».

در این سبک، هیچ‌کس جای ثابتی نداشت؛ مدافع می‌توانست گل بزند و مهاجم موظف بود دفاع کند. همه در حرکت بودند و فضای خالی را پر می‌کردند. کرویف مغز متفکر این ماشین بود؛ او با دریبل‌های ظریف، پاس‌های غیرمنتظره و آن «چرخش معروف» (کرایف‌ترن)، مدافعان را گم می‌کرد.

با آژاکس سه جام اروپا را فتح کرد (۱۹۷۱، ۱۹۷۲، ۱۹۷۳) و در فینال ۱۹۷۲ دو گل زد. پیراهن شماره ۱۴ که به‌طور تصادفی به او رسیده بود، به نماد او تبدیل شد؛ عددی که دیگر هرگز عوضش نکرد.`,
      en: `On October 15, 1964, the 17-year-old Johan made his official debut for Ajax and scored the winner that very night. But the real story began when the innovative coach Rinus Michels arrived at Ajax and built a new idea with Cruyff: "Total Football."

In this style nobody had a fixed position; a defender could score and a forward had to defend. Everyone moved, filling empty space. Cruyff was the brain of this machine — with delicate dribbles, unexpected passes and that famous "Cruyff Turn," he lost his markers.

With Ajax he conquered three European Cups (1971, 1972, 1973), scoring twice in the 1972 final. The number 14 shirt, which had come to him by chance, became his symbol — a number he never changed again.`
    },
    victoryText: {
      fa: 'با پیراهن شماره ۱۴ وارد زمین می‌شوی و هر پاس تو یک معما برای حریف است. جام اروپا در دستان تو می‌درخشد و میشل فریاد می‌زند: «این فوتبال آینده است!» آمستردام نام تو را با افتخار فریاد می‌زند.',
      en: 'You step out in the number 14 shirt and every pass is a riddle for the opponent. The European Cup shines in your hands and Michels shouts: "This is the football of the future!" Amsterdam chants your name with pride.'
    },
    year: '1964-1973',
    words: [
      { word: 'توتال', clue: 'سبک انقلابی که کرویف و میشل در آژاکس ساختند' },
      { word: 'میشل', clue: 'مربی مبتکر هلندی که معمار فوتبال توتال بود' },
      { word: 'چرخش', clue: 'حرکت معروف کرویف برای گم‌کردن مدافع' },
      { word: 'چهاردهم', clue: 'شماره پیراهن ابدی کرویف' },
      { word: 'اروپا', clue: 'جامی که کرویف سه بار با آژاکس برد' },
      { word: 'مدافع', clue: 'در فوتبال توتال او هم می‌توانست گل بزند' },
      { word: 'مهاجم', clue: 'در فوتبال توتال او هم باید دفاع می‌کرد' },
      { word: 'دریبل', clue: 'هنر ویژه کرویف برای عبور از حریف' },
      { word: 'فینال', clue: 'بازی ۱۹۷۲ که کرویف در آن دو گل زد' },
      { word: 'فضا', clue: 'در فوتبال توتال همه این خالی را پر می‌کردند' },
    ],
    bgEmoji: '🧡',
  },
  {
    id: 'cruyff_barcelona',
    legendId: 'cruyff',
    chapterIndex: 2,
    title: { fa: 'رکورد ۳ میلیون دلاری', en: 'The World-Record Transfer' },
    subtitle: { fa: 'بارسلونا و آغاز یک مکتب', en: 'Barcelona and a New School' },
    story: {
      fa: `در سال ۱۹۷۳، بارسلونا کرویف را با رقم بی‌سابقه‌ی سه میلیون دلار خرید؛ رکوردی جهانی که همه را شوکه کرد. اما کرویف فقط یک بازیکن نبود، او یک معلم بود.

در اولین فصل، بارسا پس از ۱۴ سال قهرمانی لیگ اسپانیا را به دست آورد و در همان سال، در ورزشگاه برنابئو با نتیجه‌ی ۵ بر ۰ رئال مادرید را در هم کوبید؛ شبی که هواداران بارسا هرگز فراموش نمی‌کنند. کرویف در آن بازی یک گل زد و بارها رئال را به بازی گرفت.

او سبک آژاکس را به بارسلونا آورد و پایه‌های مکتبی را گذاشت که بعدها با یوهان خودش روی نیمکت، به «توتال فوتبال» مدرن و در نهایت به تیکی‌تاکا تبدیل شد. پسر بتوندورپ حالا معمار یک فرهنگ فوتبالی بود.`,
      en: `In 1973 Barcelona signed Cruyff for an unprecedented three million dollars — a world record that shocked everyone. But Cruyff was not just a player; he was a teacher.

In his first season Barcelona won the Spanish league after 14 years, and that same year crushed Real Madrid 5-0 at the Bernabéu — a night Barça fans never forget. Cruyff scored one and tormented Real throughout.

He brought the Ajax style to Barcelona and laid the foundations of a school that would later, with Johan himself on the bench, become modern Total Football and eventually tiki-taka. The boy from Betondorp was now the architect of a football culture.`
    },
    victoryText: {
      fa: 'در برنابئو ۵ بر ۰ پیروز می‌شوی و تماشاگران سفیدپوش در سکوت فرو می‌روند. هواداران بارسا اشک شوق می‌ریزند. تو نه فقط یک بازی، بلکه یک مکتب را به کاتالونیا آورده‌ای.',
      en: 'You win 5-0 at the Bernabéu and the white-clad crowd falls silent. Barça fans weep with joy. You have brought not just a victory but a whole school of football to Catalonia.'
    },
    year: '1973-1978',
    words: [
      { word: 'بارسلونا', clue: 'باشگاهی که کرویف را با رکورد جهانی خرید' },
      { word: 'رکورد', clue: 'رقم ۳ میلیون دلاری انتقال کرویف' },
      { word: 'برنابئو', clue: 'ورزشگاه رئال که بارسا در آن ۵-۰ برد' },
      { word: 'رئال', clue: 'حریف سنتی بارسلونا که کرویف در هم کوبید' },
      { word: 'لیگ', clue: 'قهرمانی اسپانیا که بارسا پس از ۱۴ سال برد' },
      { word: 'مکتب', clue: 'سبکی که کرویف در کاتالونیا پایه‌گذاری کرد' },
      { word: 'کاتالونیا', clue: 'منطقه‌ای که بارسلونا پایتخت آن است' },
      { word: 'معمار', clue: 'نقش کرویف در ساختن فرهنگ فوتبالی بارسا' },
      { word: 'هوادار', clue: 'کسی که شب ۵-۰ را هرگز فراموش نمی‌کند' },
      { word: 'معلم', clue: 'کرویف فقط بازیکن نبود، یک ... بود' },
    ],
    bgEmoji: '🔵',
  },
  {
    id: 'cruyff_dreamteam',
    legendId: 'cruyff',
    chapterIndex: 3,
    title: { fa: 'تیم رویایی', en: 'The Dream Team' },
    subtitle: { fa: 'میراث جاودان شماره ۱۴', en: 'The Eternal Legacy of Number 14' },
    story: {
      fa: `پس از سال‌ها دوری، کرویف در سال ۱۹۸۸ به بارسلونا بازگشت؛ این بار نه به‌عنوان بازیکن، بلکه به‌عنوان سرمربی. او نسلی از ستاره‌ها را پرورش داد که به «تیم رویایی» معروف شدند.

در سال ۱۹۹۲، بارسلونا با گل دیرهنگام رونالد کومان در فینال ومبلی، اولین جام اروپای خود را بالای سر برد. این پیروزی، نتیجه‌ی مستقیم فلسفه‌ی کرویف بود: مالکیت توپ، پاس‌های کوتاه و حمله از عقب.

کرویف چهار لیگ متوالی با بارسا برد و آکادمی معروف «لاماسیا» را بنیان نهاد؛ همان آکادمی که سال‌ها بعد مسی، ژاوی و اینیستا را به جهان هدیه داد. او در سال ۲۰۱۶ از دنیا رفت، اما فلسفه‌اش هرگز نمرد. هر تیمی که امروز پاس‌کاری می‌کند، وامدار پسر بتوندورپ است.`,
      en: `After years away, Cruyff returned to Barcelona in 1988 — not as a player but as head coach. He raised a generation of stars known as the "Dream Team."

In 1992 Barcelona lifted their first European Cup at Wembley through Ronald Koeman's late goal. That victory was the direct fruit of Cruyff's philosophy: possession, short passes, building from the back.

Cruyff won four consecutive leagues with Barça and founded the famous "La Masia" academy — the same academy that later gifted the world Messi, Xavi and Iniesta. He passed away in 2016, but his philosophy never died. Every team that passes the ball today owes a debt to the boy from Betondorp.`
    },
    victoryText: {
      fa: 'جام اروپا در ومبلی بالای سر می‌رود و تو روی نیمکت می‌ایستی؛ معلمی که شاگردانش تاریخ نوشتند. لاماسیا چراغی است که تو روشن کردی و تا ابد خواهد درخشید. شماره ۱۴ هرگز فراموش نمی‌شود.',
      en: 'The European Cup is lifted at Wembley and you stand on the bench — a teacher whose students wrote history. La Masia is the lamp you lit, and it will shine forever. Number 14 will never be forgotten.'
    },
    year: '1988-2016',
    words: [
      { word: 'رویایی', clue: 'لقب تیم افسانه‌ای کرویف در بارسلونا' },
      { word: 'ومبلی', clue: 'ورزشگاه فینال ۱۹۹۲ که بارسا اولین جام اروپا را برد' },
      { word: 'کومان', clue: 'بازیکنی که گل قهرمانی ۱۹۹۲ را زد' },
      { word: 'لاماسیا', clue: 'آکادمی معروفی که کرویف بنیان گذاشت' },
      { word: 'مالکیت', clue: 'اصل اول فلسفه کرویف در فوتبال' },
      { word: 'مسی', clue: 'ستاره‌ای که لاماسیا سال‌ها بعد به جهان هدیه داد' },
      { word: 'فلسفه', clue: 'میراث اصلی کرویف برای فوتبال جهان' },
      { word: 'سرمربی', clue: 'نقش کرویف در بازگشت ۱۹۸۸ به بارسا' },
      { word: 'لیگ', clue: 'کرویف چهار بار متوالی با بارسا این را برد' },
      { word: 'میراث', clue: 'آنچه کرویف پس از خود برای فوتبال گذاشت' },
    ],
    bgEmoji: '🏆',
  },
];

// ─── FRANZ BECKENBAUER (آلمان) ─────────────────────────
// 4 فصل از زندگی «قیصر»

export const BECKENBAUER_CHAPTERS: WorldMapChapter[] = [
  {
    id: 'beckenbauer_munich',
    legendId: 'beckenbauer',
    chapterIndex: 0,
    title: { fa: 'کودکی در مونیخ ویران', en: 'A Childhood in Ruined Munich' },
    subtitle: { fa: 'پسری از خاکستر جنگ', en: 'A Boy from the Ashes of War' },
    story: {
      fa: `۱۱ سپتامبر ۱۹۴۵، چهار ماه پس از پایان جنگ جهانی دوم، فرانتس بکن‌باوئر در مونیخ به دنیا آمد؛ شهری که بیشترش در بمباران‌ها ویران شده بود. پدرش کارمند پست بود و خانواده در محله‌ی کارگریِ گیزینگ زندگی می‌کردند.

کودکی فرانتس در میان آوارها گذشت. او و دوستانش در زمین‌های خاکیِ کنار ویرانه‌ها فوتبال بازی می‌کردند. توپ‌هایشان کهنه و وصله‌پینه بود، اما عشقشان به بازی بی‌کران.

در ۱۳ سالگی به تیم جوانان بایرن مونیخ پیوست. مربیان به‌سرعت دریافتند که این پسر چیزی متفاوت دارد: آرامش عجیبی در بحبوحه‌ی بازی و نگاهی که انگار همه‌ی زمین را می‌دید. هنوز کسی نمی‌دانست که این پسر روزی «قیصر» آلمان خواهد شد.`,
      en: `On September 11, 1945, four months after World War II ended, Franz Beckenbauer was born in Munich — a city largely destroyed by bombing. His father was a postal clerk and the family lived in the working-class Giesing district.

Franz's childhood unfolded among the rubble. He and his friends played football on dirt pitches beside the ruins. Their balls were old and patched, but their love of the game was boundless.

At 13 he joined the Bayern Munich youth team. Coaches quickly saw something different in him: an uncanny calm amid the chaos of play and a gaze that seemed to see the whole pitch. Nobody yet knew this boy would one day become the "Kaiser" of Germany.`
    },
    victoryText: {
      fa: 'روی آوارهای مونیخ توپ می‌زنی و غبار جنگ را با شادیِ بازی می‌شویی. مربی جوانان بایرن به تو نگاه می‌کند و آهسته می‌گوید: این پسر آرام، روزی آلمان را رهبری خواهد کرد.',
      en: 'You play among the rubble of Munich, washing away the dust of war with the joy of the game. The Bayern youth coach looks at you and murmurs: this calm boy will one day lead Germany.'
    },
    year: '1945-1964',
    words: [
      { word: 'مونیخ', clue: 'شهری که بکن‌باوئر در آن به دنیا آمد' },
      { word: 'جنگ', clue: 'رخدادی که مونیخ را ویران کرد و بستر تولد فرانتس شد' },
      { word: 'آوار', clue: 'خرابه‌هایی که کودکان در کنارشان فوتبال بازی می‌کردند' },
      { word: 'بایرن', clue: 'باشگاهی که بکن‌باوئر در ۱۳ سالگی به جوانانش پیوست' },
      { word: 'گیزینگ', clue: 'محله کارگری مونیخ، زادگاه بکن‌باوئر' },
      { word: 'پست', clue: 'شغل پدر بکن‌باوئر' },
      { word: 'توپ', clue: 'وسیله کهنه و وصله‌پینه بازی بچه‌های مونیخ' },
      { word: 'آرامش', clue: 'ویژگی عجیب بکن‌باوئر در بحبوحه بازی' },
      { word: 'قیصر', clue: 'لقبی که بعدها به بکن‌باوئر دادند' },
      { word: 'مربی', clue: 'کسی که استعداد فرانتس نوجوان را کشف کرد' },
    ],
    bgEmoji: '🏗️',
  },
  {
    id: 'beckenbauer_bayern',
    legendId: 'beckenbauer',
    chapterIndex: 1,
    title: { fa: 'قیصر بایرن', en: 'The Kaiser of Bayern' },
    subtitle: { fa: 'لیبرو؛ مخترع یک پست', en: 'The Libero: Inventing a Position' },
    story: {
      fa: `در سال ۱۹۶۴، بکن‌باوئر ۱۸ ساله اولین بازی‌اش را برای بایرن مونیخ انجام داد. اما او یک مدافع معمولی نبود؛ او «لیبرو» بود — مدافع آزادی که پشت خط دفاع می‌ایستاد، توپ را می‌گرفت و مثل یک هافبک خلاق، بازی را از عقب می‌ساخت.

بایرن با رهبری او به قدرتی ترسناک تبدیل شد. در سال‌های ۱۹۷۴ تا ۱۹۷۶، سه جام اروپا را پشت سر هم فتح کردند؛ دستاوردی که تنها آژاکس پیش از آن به آن رسیده بود. بکن‌باوئر در قلب این موفقیت، هم دفاع می‌کرد و هم گل می‌ساخت.

در سال ۱۹۷۲ با بایرن قهرمانی لیگ را جشن گرفت و خودش به «بازیکن سال اروپا» رسید. آن‌قدر مقتدر و آرام بود که مردم آلمان او را «قیصر» نامیدند؛ لقبی اشرافی که شایسته‌ی مردی از میان آوارهای مونیخ بود.`,
      en: `In 1964 the 18-year-old Beckenbauer made his debut for Bayern Munich. But he was no ordinary defender; he was the "libero" — a free defender who stood behind the back line, took the ball and, like a creative midfielder, built play from the back.

Under his leadership Bayern became a fearsome power. From 1974 to 1976 they won three consecutive European Cups — a feat only Ajax had achieved before. At the heart of it, Beckenbauer both defended and created goals.

In 1972 he celebrated the league title with Bayern and was named European Footballer of the Year. So commanding and calm was he that the German people called him the "Kaiser" — an aristocratic title befitting a man who rose from the rubble of Munich.`
    },
    victoryText: {
      fa: 'توپ را در قلب دفاع می‌گیری و مثل یک رهبر، ارکستر بازی را هدایت می‌کنی. سه جام اروپا پشت سر هم بالا می‌رود و آلمان نام تو را فریاد می‌زند: قیصر! قیصر!',
      en: 'You take the ball at the heart of defense and, like a leader, conduct the orchestra of the game. Three European Cups rise in succession and Germany chants your name: Kaiser! Kaiser!'
    },
    year: '1964-1977',
    words: [
      { word: 'لیبرو', clue: 'پستی که بکن‌باوئر در آن استاد بود؛ مدافع آزاد' },
      { word: 'دفاع', clue: 'خطی که بکن‌باوئر رهبر آن بود' },
      { word: 'هافبک', clue: 'بکن‌باوئر مثل این بازیکنان بازی را می‌ساخت' },
      { word: 'اروپا', clue: 'جامی که بایرن با بکن‌باوئر سه بار پیاپی برد' },
      { word: 'آلمان', clue: 'کشوری که لقب قیصر را به فرانتس داد' },
      { word: 'بایرن', clue: 'باشگاهی که بکن‌باوئر عمرش را در آن گذراند' },
      { word: 'رهبر', clue: 'نقش بکن‌باوئر در قلب خط دفاع بایرن' },
      { word: 'آرام', clue: 'ویژگی بارز بکن‌باوئر روی توپ' },
      { word: 'لقب', clue: 'عنوان «قیصر» که به بکن‌باوئر دادند' },
      { word: 'دفاع', clue: 'بکن‌باوئر هم این کار و هم گل‌سازی می‌کرد' },
    ],
    bgEmoji: '🛡️',
  },
  {
    id: 'beckenbauer_1974',
    legendId: 'beckenbauer',
    chapterIndex: 2,
    title: { fa: 'قهرمانی جهان ۱۹۷۴', en: 'World Cup 1974' },
    subtitle: { fa: 'کاپیتانی که جام را بالا برد', en: 'The Captain Who Lifted the Cup' },
    story: {
      fa: `جام جهانی ۱۹۷۴ در خانه، در آلمان برگزار می‌شد. بکن‌باوئر کاپیتان تیم ملی بود و تمام ملت به او چشم دوخته بودند. اما فینال، مصاف با هلندِ کرویف و «فوتبال توتال» بود؛ تیمی که همه آن را شکست‌ناپذیر می‌دانستند.

هلند در دقایق اول پنالتی گرفت و پیش افتاد. آلمان به لطف رهبری آرام بکن‌باوئر و گل‌های گرد مولر، بازی را ۲-۱ برد. بکن‌باوئر جام را بالای سر برد و در تاریخ ثبت شد که بزرگ‌ترین دوئل تاکتیکی قرن را برده است.

این بازی، نبرد دو فلسفه بود: انعطاف توتال هلند در برابر انضباط و اراده‌ی آلمان. قیصر ثابت کرد که آرامش در طوفان، خودش یک تاکتیک است.`,
      en: `The 1974 World Cup was held at home in Germany. Beckenbauer captained the national team and the whole nation looked to him. But the final was a clash with Cruyff's Netherlands and "Total Football" — a team many deemed unbeatable.

The Dutch won an early penalty and led. Germany, thanks to Beckenbauer's calm leadership and Gerd Müller's goals, won 2-1. Beckenbauer lifted the cup, and history recorded that he had won the century's greatest tactical duel.

The match was a battle of two philosophies: the fluidity of Dutch Total Football against German discipline and will. The Kaiser proved that calm amid the storm is itself a tactic.`
    },
    victoryText: {
      fa: 'جام طلایی را در دست می‌گیری و میلیون‌ها آلمانی اشک شوق می‌ریزند. تو در برابر توفانِ هلند ایستادی و مثل کوهی آرام، ملتت را به قله رساندی. قیصر، جام از آنِ توست.',
      en: 'You hold the golden trophy and millions of Germans weep with joy. You stood against the Dutch storm and, calm as a mountain, carried your nation to the summit. Kaiser, the cup is yours.'
    },
    year: '1974',
    words: [
      { word: 'جام', clue: 'جام جهانی ۱۹۷۴ که بکن‌باوئر بالای سر برد' },
      { word: 'کاپیتان', clue: 'نقش بکن‌باوئر در تیم ملی آلمان' },
      { word: 'هلند', clue: 'حریف آلمان در فینال ۱۹۷۴' },
      { word: 'پنالتی', clue: 'گلی که هلند در دقایق اول فینال زد' },
      { word: 'مولر', clue: 'بازیکنی که گل‌های آلمان را در فینال زد' },
      { word: 'فلسفه', clue: 'هر تیم در این فینال یک ... داشت' },
      { word: 'انضباط', clue: 'ویژگی فوتبال آلمان در برابر توتال هلند' },
      { word: 'فینال', clue: 'بازی نهایی جام جهانی ۱۹۷۴' },
      { word: 'آلمان', clue: 'کشوری که میزبان و قهرمان ۱۹۷۴ بود' },
      { word: 'اراده', clue: 'نیرویی که آلمان را در برابر توفان پیروز کرد' },
    ],
    bgEmoji: '🏆',
  },
  {
    id: 'beckenbauer_coach',
    legendId: 'beckenbauer',
    chapterIndex: 3,
    title: { fa: 'قیصر روی نیمکت', en: 'The Kaiser on the Bench' },
    subtitle: { fa: 'قهرمانی جهان به‌عنوان سرمربی', en: 'World Champion as a Coach' },
    story: {
      fa: `بکن‌باوئر در سال ۱۹۷۷ از فوتبال ملی خداحافظی کرد و برای سال‌های آخر به آمریکا رفت. اما فوتبال آلمان او را رها نکرد. در سال ۱۹۸۴، در بحران، هدایت تیم ملی به او سپرده شد.

او تیمی جوان و بی‌تجربه را ساخت و در جام جهانی ۱۹۸۶ به فینال رسید، هرچند به آرژانتین مارادونا باخت. اما در ۱۹۹۰، انتقام گرفت؛ آلمان در فینال مقابل آرژانتین ۱-۰ برد و بکن‌باوئر به دومین مرد تاریخ تبدیل شد که هم به‌عنوان بازیکن و هم به‌عنوان سرمربی قهرمان جهان شده است.

او بعدها مدیر بایرن و معمار موفقیت‌های آن شد. قیصر نه فقط روی چمن، بلکه در تمام عمرش رهبر بود.`,
      en: `Beckenbauer retired from international football in 1977 and spent his final years in America. But German football did not let him go. In 1984, amid crisis, the national team was handed to him.

He built a young, inexperienced side and reached the 1986 World Cup final, though losing to Maradona's Argentina. But in 1990 he took revenge; Germany beat Argentina 1-0 in the final, making Beckenbauer the second man in history to win the World Cup both as a player and as a coach.

He later became a Bayern director and the architect of its successes. The Kaiser was a leader not only on the grass but throughout his life.`
    },
    victoryText: {
      fa: 'روی خط کنار زمین می‌ایستی و شاگردانت جام را بالا می‌برند. تو حالا هم به‌عنوان بازیکن و هم به‌عنوان مربی قهرمان جهان شده‌ای. قیصر، تاریخ را دو بار فتح کردی.',
      en: 'You stand on the touchline and your players lift the cup. You are now a world champion both as a player and as a coach. Kaiser, you conquered history twice.'
    },
    year: '1984-1990',
    words: [
      { word: 'نیمکت', clue: 'جایی که بکن‌باوئر در نقش سرمربی نشست' },
      { word: 'سرمربی', clue: 'نقشی که بکن‌باوئر را دوباره قهرمان جهان کرد' },
      { word: 'آرژانتین', clue: 'حریفی که آلمان در فینال ۱۹۹۰ شکست داد' },
      { word: 'جوان', clue: 'ویژگی تیمی که بکن‌باوئر در ۱۹۸۴ ساخت' },
      { word: 'بایرن', clue: 'باشگاهی که بکن‌باوئر بعدها مدیرش شد' },
      { word: 'فینال', clue: 'بازی نهایی جام جهانی ۱۹۹۰' },
      { word: 'تاریخ', clue: 'جایی که نام بکن‌باوئر دو بار ثبت شد' },
      { word: 'رهبر', clue: 'نقش همیشگی بکن‌باوئر در فوتبال آلمان' },
      { word: 'جام', clue: 'جایزه‌ای که بکن‌باوئر به‌عنوان مربی هم برد' },
      { word: 'مدیر', clue: 'نقشی که بکن‌باوئر سال‌ها بعد در بایرن گرفت' },
    ],
    bgEmoji: '🎩',
  },
];

// ─── RONALDINHO (برزیل) ────────────────────────────────
// 4 فصل از زندگی «جادوگر»

export const RONALDINHO_CHAPTERS: WorldMapChapter[] = [
  {
    id: 'ronaldinho_porto_alegre',
    legendId: 'ronaldinho',
    chapterIndex: 0,
    title: { fa: 'پسری با لبخند همیشگی', en: 'The Boy with the Everlasting Smile' },
    subtitle: { fa: 'زادگاه پورتو آلگره', en: 'Born in Porto Alegre' },
    story: {
      fa: `۲۱ مارس ۱۹۸۰، در پورتو آلگره در جنوب برزیل، رونالدینیو گاوسو به دنیا آمد. خانواده‌اش فوتبالی بودند؛ پدرش ژوآو، دروازه‌بان نیمه‌حرفه‌ای بود و برادرش روبرتو، بازیکن گرِمیو. خانه‌شان پر از توپ و خنده بود.

پدرش در هشت سالگی او را از دست داد، اما خاطره‌ی جمله‌اش تا همیشه با او ماند: «با لبخند بازی کن.» رونالدینیو همین کار را کرد؛ در تمام عمرش فوتبال را مثل یک جشن بازی کرد، نه یک جنگ.

در زمین خاکیِ محله، او با سگ‌ها و بچه‌های کوچک‌تر بازی می‌کرد و یاد گرفت که چطور از میان انبوه مدافعان، با یک حرکت ظریف، راهی پیدا کند. استعدادش مثل شکوفه‌ای در بهار می‌شکفت.`,
      en: `On March 21, 1980, in Porto Alegre in southern Brazil, Ronaldinho Gaúcho was born. His family was footballing; his father João was a semi-pro goalkeeper and his brother Roberto played for Grêmio. Their home was full of balls and laughter.

He lost his father at eight, but the memory of his words stayed forever: "Play with a smile." Ronaldinho did exactly that — all his life he played football like a celebration, not a war.

On the neighborhood dirt pitch he played with dogs and smaller kids, learning how to find a way through crowds of defenders with one delicate move. His talent bloomed like a spring flower.`
    },
    victoryText: {
      fa: 'با توپ کهنه در کوچه‌های پورتو آلگره می‌چرخی و لبخند از لبت جدا نمی‌شود. پدرت از دور نگاهت می‌کند و می‌گوید: همین‌طور بازی کن، پسرم. با لبخند.',
      en: 'You weave with an old ball through the streets of Porto Alegre, a smile never leaving your lips. Your father watches from afar and says: keep playing like this, my son. With a smile.'
    },
    year: '1980-1998',
    words: [
      { word: 'پورتو', clue: 'شهر زادگاه رونالدینیو در جنوب برزیل' },
      { word: 'آلگره', clue: 'بخش دوم نام شهر زادگاه رونالدینیو' },
      { word: 'لبخند', clue: 'سفارش همیشگی پدر رونالدینیو برای بازی' },
      { word: 'برادر', clue: 'روبرتو؛ بازیکن گرِمیو و برادر رونالدینیو' },
      { word: 'پدر', clue: 'کسی که رونالدینیو در ۸ سالگی از دست داد' },
      { word: 'دروازه‌بان', clue: 'پست پدر رونالدینیو در فوتبال نیمه‌حرفه‌ای' },
      { word: 'گرِمیو', clue: 'باشگاهی که برادر رونالدینیو در آن بازی می‌کرد' },
      { word: 'برزیل', clue: 'کشور زادگاه رونالدینیو' },
      { word: 'جشن', clue: 'رونالدینیو فوتبال را مثل این می‌دید، نه یک جنگ' },
      { word: 'مدافع', clue: 'رونالدینیو با یک حرکت ظریف از میان انبوه این‌ها رد می‌شد' },
    ],
    bgEmoji: '😄',
  },
  {
    id: 'ronaldinho_gremio_psg',
    legendId: 'ronaldinho',
    chapterIndex: 1,
    title: { fa: 'از گرِمیو تا پاریس', en: 'From Grêmio to Paris' },
    subtitle: { fa: 'جادوگر کوچک برزیل', en: 'Brazil\'s Little Magician' },
    story: {
      fa: `رونالدینیو در گرِمیو بزرگ شد و در سال ۱۹۹۸ اولین بازی حرفه‌ای‌اش را انجام داد. هواداران به‌زودی عاشق او شدند؛ کسی که با هر لمس توپ، تماشاگران را از صندلی بلند می‌کرد.

در سال ۱۹۹۹، با تیم ملی برزیل قهرمان کوپا آمه‌ریکا شد و در جام کنفدراسیون‌ها با یک گلِ تماشایی از پشت محوطه — با آن «گل» معروفش که توپ را از میان مدافعان به گوشه فرستاد — جهان را مسحور کرد. همان‌جا بود که لقب «جادوگر» را گرفت.

در سال ۲۰۰۱ به پاری سن ژرمن رفت. زندگی در پاریس برای او دشوار بود؛ اما در زمین، هر بار که توپ به پایش می‌رسید، جادو از نو آغاز می‌شد. اروپا می‌فهمید که با یک نابغه روبرو است.`,
      en: `Ronaldinho grew up at Grêmio and made his professional debut in 1998. Fans soon fell in love with him; a man who lifted the crowd off their seats with every touch.

In 1999 he won the Copa América with Brazil and mesmerized the world at the Confederations Cup with a spectacular goal from outside the box — his famous strike that sent the ball through defenders into the corner. There he earned the nickname "the Magician."

In 2001 he moved to Paris Saint-Germain. Life in Paris was hard for him, but on the pitch, every time the ball reached his feet, the magic began anew. Europe realized it was facing a genius.`
    },
    victoryText: {
      fa: 'توپ را از پشت محوطه رها می‌کنی و در گوشه‌ی دروازه می‌نشیند. استادیوم منفجر می‌شود و تو با آن لبخند همیشگی، دست‌ها را باز می‌کنی. جهان تازه فهمید که جادوگر متولد شده است.',
      en: 'You release the ball from outside the box and it settles in the corner. The stadium erupts and you open your arms with that everlasting smile. The world has just realized a magician is born.'
    },
    year: '1998-2003',
    words: [
      { word: 'گرِمیو', clue: 'باشگاه برزیلی که رونالدینیو در آن حرفه‌ای شد' },
      { word: 'پاریس', clue: 'شهری که رونالدینیو در ۲۰۰۱ به آن نقل مکان کرد' },
      { word: 'کوپا', clue: 'جام قهرمانی آمریکای جنوبی که رونالدینیو در ۱۹۹۹ برد' },
      { word: 'جادوگر', clue: 'لقبی که رونالدینیو در جام کنفدراسیون‌ها گرفت' },
      { word: 'گل', clue: 'ضربه تماشایی رونالدینیو از پشت محوطه در ۱۹۹۹' },
      { word: 'برزیل', clue: 'تیم ملی رونالدینیو در کوپا آمه‌ریکا' },
      { word: 'نابغه', clue: 'چیزی که اروپا در رونالدینیو دید' },
      { word: 'هوادار', clue: 'کسی که با هر لمس توپ رونالدینیو از جا برمی‌خاست' },
      { word: 'اروپا', clue: 'قاره‌ای که رونالدینیو در ۲۰۰۱ به آن آمد' },
      { word: 'تماشایی', clue: 'وصف ضربه معروف رونالدینیو در ۱۹۹۹' },
    ],
    bgEmoji: '🪄',
  },
  {
    id: 'ronaldinho_barcelona',
    legendId: 'ronaldinho',
    chapterIndex: 2,
    title: { fa: 'جادو در نیوکمپ', en: 'Magic at the Camp Nou' },
    subtitle: { fa: 'توپ طلا و ایستاده تشویق شدن', en: 'The Ballon d\'Or and a Standing Ovation' },
    story: {
      fa: `در سال ۲۰۰۳، رونالدینیو به بارسلونا پیوست؛ تیمی در بحران که هوادارانش ناامید بودند. اما او فقط در یک فصل، بارسا را دگرگون کرد. نیوکمپ دوباره پر از شور و شادی شد.

در نوامبر ۲۰۰۵، در ال‌کلاسیکو مقابل رئال مادرید، رونالدینیو دو گل فراموش‌نشدنی زد. تماشاگران رئال در برنابئو، در اقدامی بی‌سابقه، او را ایستاده تشویق کردند. حتی رقیب هم به عظمت او اعتراف کرد.

در همان سال، توپ طلا و عنوان بهترین بازیکن جهان را برد. او رهبر تیمی شد که در ۲۰۰۶ لیگ قهرمانان را فتح کرد و در همان سال، نوجوانی به نام مسی را زیر بال خود گرفت. جادوی او نه فقط تماشایی، بلکه بخشنده بود.`,
      en: `In 2003 Ronaldinho joined Barcelona — a club in crisis whose fans were disillusioned. But in a single season he transformed Barça. The Camp Nou was full of passion and joy again.

In November 2005, in El Clásico against Real Madrid, Ronaldinho scored two unforgettable goals. The Real fans at the Bernabéu, unprecedentedly, gave him a standing ovation. Even the rival admitted his greatness.

That same year he won the Ballon d'Or and the world's best player award. He led the team that won the Champions League in 2006 and, in that same year, took a teenager named Messi under his wing. His magic was not only spectacular but generous.`
    },
    victoryText: {
      fa: 'دو گل می‌زنی و تماشاگران رئال، رقیب دیرینه، تو را ایستاده تشویق می‌کنند. توپ طلا در دستانت می‌درخشد و در کنار تو، نوجوانی به نام مسی لبخند می‌زند. جادوگر، تو قلب فوتبال را تسخیر کردی.',
      en: 'You score twice and the Real fans, your oldest rivals, give you a standing ovation. The Ballon d\'Or shines in your hands and beside you a teenager named Messi smiles. Magician, you captured the heart of football.'
    },
    year: '2003-2008',
    words: [
      { word: 'نیوکمپ', clue: 'ورزشگاه بارسلونا که رونالدینیو آن را پر از شادی کرد' },
      { word: 'طلا', clue: 'توپی که رونالدینیو در ۲۰۰۵ برد' },
      { word: 'برنابئو', clue: 'ورزشگاهی که تماشاگرانش رونالدینیو را ایستاده تشویق کردند' },
      { word: 'رئال', clue: 'حریف بارسا در ال‌کلاسیکوی معروف ۲۰۰۵' },
      { word: 'تشویق', clue: 'کاری که تماشاگران رئال برای رونالدینیو کردند' },
      { word: 'مسی', clue: 'نوجوانی که رونالدینیو زیر بال خود گرفت' },
      { word: 'قهرمانان', clue: 'لیگی که بارسا در ۲۰۰۶ با رونالدینیو فتح کرد' },
      { word: 'کلاسیکو', clue: 'نام بازی بارسا و رئال که رونالدینیو در آن درخشید' },
      { word: 'گل', clue: 'رونالدینیو در ال‌کلاسیکوی ۲۰۰۵ دو تا از این زد' },
      { word: 'بخشنده', clue: 'ویژگی جادوی رونالدینیو که آن را به دیگران هم می‌داد' },
    ],
    bgEmoji: '✨',
  },
  {
    id: 'ronaldinho_samba',
    legendId: 'ronaldinho',
    chapterIndex: 3,
    title: { fa: 'سامبای جاودان', en: 'The Eternal Samba' },
    subtitle: { fa: 'شادی که هرگز خاموش نشد', en: 'A Joy That Never Faded' },
    story: {
      fa: `رونالدینیو پس از بارسلونا به میلان رفت و در سال ۲۰۱۱ به زادگاهش، برزیل، بازگشت. پیراهن تیم‌های فلامینگو، اتلتیکو مینیرو و کویابا را پوشید و در سال ۲۰۱۳ با مینیرو قهرمان کوپا لیبرتادورس شد.

اما بزرگ‌ترین میراث او، جام‌ها نبود. او به نسل جدید نشان داد که فوتبال می‌تواند زیبا، شاد و پر از خلاقیت باشد. حرکت‌های او الهام‌بخش ستاره‌هایی مثل مسی و نیمار شد.

در سال ۲۰۱۸ از فوتبال خداحافظی کرد. هواداران در سراسر جهان با چشمانی اشک‌آلود او را بدرقه کردند، اما لبخندش در یادها ماند. رونالدینیو ثابت کرد که می‌توان برنده شد و در همان حال، لبخند زد.`,
      en: `After Barcelona, Ronaldinho moved to Milan and in 2011 returned to his homeland, Brazil. He wore the shirts of Flamengo, Atlético Mineiro and Querétaro, winning the Copa Libertadores with Mineiro in 2013.

But his greatest legacy was not the trophies. He showed a new generation that football could be beautiful, joyful and full of creativity. His moves inspired stars like Messi and Neymar.

He retired in 2018. Fans around the world bid him farewell with tearful eyes, but his smile remained in memory. Ronaldinho proved that you can win and, at the same time, smile.`
    },
    victoryText: {
      fa: 'پس از سال‌ها، به خانه بازمی‌گردی و همان‌جا که روزی با توپ کهنه بازی می‌کردی، جام لیبرتادورس را بالا می‌بری. بچه‌های محله به تو نگاه می‌کنند و می‌فهمند: می‌شود برنده شد و لبخند زد.',
      en: 'After years you return home, and where you once played with an old ball you lift the Libertadores. The kids of the neighborhood look at you and understand: you can win and still smile.'
    },
    year: '2008-2018',
    words: [
      { word: 'میلان', clue: 'باشگاه ایتالیایی که رونالدینیو پس از بارسا به آن رفت' },
      { word: 'لیبرتادورس', clue: 'جام آمریکای جنوبی که رونالدینیو در ۲۰۱۳ با مینیرو برد' },
      { word: 'مینیرو', clue: 'باشگاه برزیلی که رونالدینیو با آن قهرمان لیبرتادورس شد' },
      { word: 'فلامینگو', clue: 'یکی از باشگاه‌های برزیلی رونالدینیو' },
      { word: 'نیمار', clue: 'ستاره‌ای که از حرکت‌های رونالدینیو الهام گرفت' },
      { word: 'خلاقیت', clue: 'میراث اصلی رونالدینیو برای نسل جدید' },
      { word: 'لبخند', clue: 'چیزی که از رونالدینیو در یادها ماند' },
      { word: 'برزیل', clue: 'کشوری که رونالدینیو در ۲۰۱۱ به آن بازگشت' },
      { word: 'خداحافظی', clue: 'کاری که رونالدینیو در ۲۰۱۸ از فوتبال کرد' },
      { word: 'شادی', clue: 'روحیه‌ای که رونالدینیو به فوتبال هدیه داد' },
    ],
    bgEmoji: '🎉',
  },
];

// ─── RONALDO NAZÁRIO (برزیل) ───────────────────────────
// 4 فصل از زندگی «پدیده»

export const RONALDO9_CHAPTERS: WorldMapChapter[] = [
  {
    id: 'ronaldo9_cruzeiro',
    legendId: 'ronaldo9',
    chapterIndex: 0,
    title: { fa: 'پدیده‌ی نوجوان', en: 'The Teenage Phenomenon' },
    subtitle: { fa: 'ظهور برق‌آسا در کروزیرو', en: 'A Lightning Rise at Cruzeiro' },
    story: {
      fa: `۱۸ سپتامبر ۱۹۷۶، در ریو دو ژانیرو، رونالدو لوئیس نازاریو دی لیما به دنیا آمد. خانواده‌اش تنگ‌دست بودند و او در محله‌ی بنتو ریبیرو، با توپ در کوچه‌ها بزرگ شد. از همان کودکی، سرعت و قدرت بدنی‌اش زبانزد بود.

در سال ۱۹۹۳، در ۱۶ سالگی، به کروزیرو پیوست. تنها ۴۴ بازی کافی بود تا نامش بر سر زبان‌ها بیفتد: ۴۴ گل در یک فصل. مدافعان نمی‌دانستند او را چگونه متوقف کنند؛ او هم سریع‌تر از آن‌ها می‌دوید و هم زورش بیشتر بود.

در سال ۱۹۹۴ به تیم ملی برزیل دعوت شد و به جام جهانی رفت، هرچند بازی نکرد. اما جهان تازه شروع کرده بود به شناختن پسری که به‌زودی «پدیده» نام می‌گرفت.`,
      en: `On September 18, 1976, in Rio de Janeiro, Ronaldo Luís Nazário de Lima was born. His family was poor and he grew up in the Bento Ribeiro neighborhood, playing with a ball in the alleys. Even as a child his speed and physical power were legendary.

In 1993, at 16, he joined Cruzeiro. Just 44 games were enough to make his name: 44 goals in a single season. Defenders did not know how to stop him; he ran faster than them and was stronger too.

In 1994 he was called up to Brazil and went to the World Cup, though he did not play. But the world was only beginning to know a boy who would soon be called "O Fenômeno" — the Phenomenon.`
    },
    victoryText: {
      fa: 'توپ را در نیمه‌ی حریف می‌گیری و با سرعتی باورنکردنی از میان مدافعان می‌گذری. دروازه‌بان تنها می‌تواند نگاه کند. مردم فریاد می‌زنند: پدیده! پدیده!',
      en: 'You take the ball in the opponent\'s half and blaze past the defenders at unbelievable speed. The keeper can only watch. The crowd roars: Phenomenon! Phenomenon!'
    },
    year: '1976-1994',
    words: [
      { word: 'ریو', clue: 'شهری که رونالدو نازاریو در آن به دنیا آمد' },
      { word: 'کروزیرو', clue: 'باشگاهی که رونالدو در ۱۶ سالگی به آن پیوست' },
      { word: 'پدیده', clue: 'لقب معروف رونالدو نازاریو' },
      { word: 'سرعت', clue: 'ویژگی بارز بازی رونالدو که مدافعان را ناتوان می‌کرد' },
      { word: 'مدافع', clue: 'کسی که نمی‌دانست چگونه رونالدو را متوقف کند' },
      { word: 'برزیل', clue: 'کشوری که رونالدو در ۱۹۹۴ به تیم ملی‌اش دعوت شد' },
      { word: 'گل', clue: 'رونالدو در یک فصل ۴۴ تا از این برای کروزیرو زد' },
      { word: 'قدرت', clue: 'ویژگی بدنی رونالدو در کنار سرعتش' },
      { word: 'دروازه‌بان', clue: 'کسی که در برابر سرعت رونالدو تنها می‌ماند' },
      { word: 'نوجوان', clue: 'رونالدو در ۱۶ سالگی این بود که به کروزیرو پیوست' },
    ],
    bgEmoji: '⚡',
  },
  {
    id: 'ronaldo9_europe',
    legendId: 'ronaldo9',
    chapterIndex: 1,
    title: { fa: 'فتح اروپا در ۲۰ سالگی', en: 'Conquering Europe at 20' },
    subtitle: { fa: 'پی‌اس‌وی، بارسا و اینتر', en: 'PSV, Barça and Inter' },
    story: {
      fa: `رونالدو در ۱۷ سالگی به پی‌اس‌وی آیندهوون رفت و در دو فصل ۵۴ گل زد. سپس بارسلونا او را خرید و در فصل ۹۷-۱۹۹۶، در ۲۰ سالگی، ۴۷ گل در ۴۹ بازی زد؛ از جمله گلی که با دریبل از میان پنج مدافع کامپوستلا زد و به «گل قرن» معروف شد.

در سال ۱۹۹۶ و ۱۹۹۷، عنوان بهترین بازیکن جهان را برد و در ۲۱ سالگی توپ طلا گرفت؛ جوان‌ترین برنده‌ی آن زمان. سپس اینتر او را با رکورد جهانی خرید.

اما در ایتالیا، سرنوشت تلخ شد. در سال ۱۹۹۹ و ۲۰۰۰، دو آسیب سنگین زانو او را بیش از دو سال از میدان دور کرد. لحظه‌ی به‌خاک‌افتادنش در فینال کوپا ایتالیا، قلب میلیون‌ها نفر را شکست.`,
      en: `At 17 Ronaldo went to PSV Eindhoven and scored 54 goals in two seasons. Barcelona then signed him and in 1996-97, at 20, he scored 47 goals in 49 games — including a goal where he dribbled through five Compostela defenders, known as the "goal of the century."

In 1996 and 1997 he was named the world's best player and at 21 won the Ballon d'Or — the youngest winner at the time. Inter then signed him for a world record fee.

But in Italy fate turned bitter. In 1999 and 2000, two severe knee injuries kept him out for over two years. The image of him collapsing in the Coppa Italia final broke the hearts of millions.`
    },
    victoryText: {
      fa: 'با دریبلی که پنج مدافع را پشت سر می‌گذارد، دروازه را می‌گشایی. توپ طلا در دستان توست و جهان در برابر پدیده سر تعظیم فرود می‌آورد. اما سرنوشت، آزمونی سخت در راه دارد...',
      en: 'With a dribble that leaves five defenders behind, you open the goal. The Ballon d\'Or is in your hands and the world bows to the Phenomenon. But fate has a hard test on the road...'
    },
    year: '1994-2000',
    words: [
      { word: 'آیندهوون', clue: 'شهر هلندی که رونالدو در پی‌اس‌وی بازی کرد' },
      { word: 'بارسلونا', clue: 'باشگاهی که رونالدو در ۲۰ سالگی ۴۷ گل برایش زد' },
      { word: 'اینتر', clue: 'باشگاه ایتالیایی که رونالدو را با رکورد جهانی خرید' },
      { word: 'زانو', clue: 'عضوی که دو آسیب سنگین به رونالدو زد' },
      { word: 'دریبل', clue: 'هنری که رونالدو با آن پنج مدافع را رد کرد' },
      { word: 'ایتالیا', clue: 'کشوری که سرنوشت تلخ مصدومیت در آن رقم خورد' },
      { word: 'جهان', clue: 'رونالدو در ۱۹۹۶ و ۱۹۹۷ بهترین بازیکن این بود' },
      { word: 'آسیب', clue: 'بلایی که رونالدو را دو سال از میدان دور کرد' },
      { word: 'قرن', clue: 'گل رونالدو به کامپوستلا این لقب را گرفت' },
      { word: 'جوان', clue: 'رونالدو در ۲۱ سالگی ...‌ترین برنده توپ طلا شد' },
    ],
    bgEmoji: '🌟',
  },
  {
    id: 'ronaldo9_return',
    legendId: 'ronaldo9',
    chapterIndex: 2,
    title: { fa: 'بازگشت و جام جهانی ۲۰۰۲', en: 'The Return and World Cup 2002' },
    subtitle: { fa: 'هشت گل که برزیل را قهرمان کرد', en: 'Eight Goals That Crowned Brazil' },
    story: {
      fa: `دو سال دوری از میدان، برای بسیاری پایان یک فوتبالیست است. اما رونالدو تسلیم نشد. او ماه‌ها در سکوت تمرین کرد و در سال ۲۰۰۲، با موهای معروفش، به جام جهانی رفت.

آن جام، رونالدو بود. هشت گل زد؛ دو گل در فینال مقابل آلمان، از جمله گلی که اولیور کان، بهترین دروازه‌بان جهان، را شکست. برزیل قهرمان شد و رونالدو کفش طلای جام را برد.

او ثابت کرد که پس از سقوط، می‌توان دوباره برخاست. اشک‌هایش پس از فینال، نه از ضعف، بلکه از پیروزی بر درد بود. جهان به پدیده‌ای نگاه می‌کرد که از خاکستر خود برخاسته بود.`,
      en: `Two years away from the pitch ends many a footballer's career. But Ronaldo did not surrender. He trained in silence for months and in 2002, with his famous haircut, went to the World Cup.

That tournament was Ronaldo. He scored eight goals; two in the final against Germany, including one that beat Oliver Kahn, the world's best goalkeeper. Brazil were champions and Ronaldo took the Golden Boot.

He proved that after a fall one can rise again. His tears after the final were not of weakness but of victory over pain. The world watched a phenomenon who had risen from his own ashes.`
    },
    victoryText: {
      fa: 'در فینال مقابل آلمان دو گل می‌زنی و جام جهانی را بالای سر می‌بری. اشک در چشمانت حلقه زده؛ نه از درد، بلکه از پیروزی. پدیده، تو از خاکستر برخاستی و تاریخ را نوشتی.',
      en: 'You score twice in the final against Germany and lift the World Cup. Tears fill your eyes — not of pain, but of triumph. Phenomenon, you rose from the ashes and wrote history.'
    },
    year: '2000-2002',
    words: [
      { word: 'بازگشت', clue: 'عنوان فصل ۲۰۰۲ رونالدو پس از دو سال مصدومیت' },
      { word: 'جام', clue: 'جام جهانی ۲۰۰۲ که رونالدو با برزیل فتح کرد' },
      { word: 'کان', clue: 'دروازه‌بان بزرگ آلمان که رونالدو در فینال شکست داد' },
      { word: 'فینال', clue: 'بازی نهایی ۲۰۰۲ مقابل آلمان' },
      { word: 'کفش', clue: 'جایزه آقای گلی که رونالدو در ۲۰۰۲ برد' },
      { word: 'هشت', clue: 'تعداد گل‌های رونالدو در جام جهانی ۲۰۰۲' },
      { word: 'اشک', clue: 'آنچه پس از فینال ۲۰۰۲ از چشمان رونالدو جاری شد' },
      { word: 'برزیل', clue: 'کشوری که در ۲۰۰۲ با گل‌های رونالدو قهرمان شد' },
      { word: 'تمرین', clue: 'کاری که رونالدو در سکوت ماه‌ها انجام داد' },
      { word: 'آلمان', clue: 'حریف برزیل در فینال ۲۰۰۲' },
    ],
    bgEmoji: '🥇',
  },
  {
    id: 'ronaldo9_legacy',
    legendId: 'ronaldo9',
    chapterIndex: 3,
    title: { fa: 'رئال، میلان و میراث', en: 'Real, Milan and a Legacy' },
    subtitle: { fa: 'گلزنی که هرگز فراموش نشد', en: 'A Scorer Never Forgotten' },
    story: {
      fa: `رونالدو در سال ۲۰۰۲ به رئال مادرید پیوست و در اولین فصل، ۳۰ گل زد. هواداران برنابئو عاشق او شدند. سپس به میلان رفت و در سال ۲۰۰۷ اولین بازیکنی شد که برای دو باشگاه مختلف (رئال و میلان) در ال‌کلاسیکو و دربی میلان گل زده است.

او با برزیل، دو جام جهانی (۱۹۹۴ و ۲۰۰۲) و دو کوپا آمه‌ریکا برد. در ۲۰۱۱ خداحافظی کرد. در پایان، ۴۱۴ گل باشگاهی و ۶۲ گل ملی در کارنامه‌اش ثبت شد.

رونالدو نازاریو برای همیشه «پدیده» می‌ماند؛ مهاجمی که ترکیب سرعت، قدرت و تکنیکش را فوتبال پیش و پس از او کمتر به خود دیده است. او نشان داد که استعداد، اگر با اراده همراه شود، بر هر زخمی پیروز می‌شود.`,
      en: `In 2002 Ronaldo joined Real Madrid and scored 30 goals in his first season. The Bernabéu faithful fell in love with him. He then moved to Milan and in 2007 became the first player to score in both El Clásico and the Milan derby for two different clubs (Real and Milan).

With Brazil he won two World Cups (1994 and 2002) and two Copa Américas. He retired in 2011. In the end, 414 club goals and 62 international goals stood in his record.

Ronaldo Nazário will forever be "O Fenômeno" — a striker whose blend of speed, power and technique football has rarely seen before or since. He showed that talent, joined to will, conquers every wound.`
    },
    victoryText: {
      fa: 'پیراهن سفید رئال را می‌پوشی و برنابئو نامت را فریاد می‌زند. سال‌ها بعد، در میان تشویق هواداران، از فوتبال خداحافظی می‌کنی. پدیده، تو ثابت کردی که هیچ زخمی نمی‌تواند استعداد را متوقف کند.',
      en: 'You wear the white shirt of Real and the Bernabéu chants your name. Years later, amid the crowd\'s applause, you bid football farewell. Phenomenon, you proved no wound can stop talent.'
    },
    year: '2002-2011',
    words: [
      { word: 'رئال', clue: 'باشگاهی که رونالدو در ۲۰۰۲ به آن پیوست' },
      { word: 'میلان', clue: 'باشگاه ایتالیایی که رونالدو در ۲۰۰۷ به آن رفت' },
      { word: 'دربی', clue: 'بازی میلان و اینتر که رونالدو در آن گل زد' },
      { word: 'کلاسیکو', clue: 'بازی رئال و بارسا که رونالدو در آن گل زد' },
      { word: 'خداحافظی', clue: 'کاری که رونالدو در ۲۰۱۱ از فوتبال کرد' },
      { word: 'تکنیک', clue: 'ویژگی رونالدو در کنار سرعت و قدرتش' },
      { word: 'گل', clue: 'رونالدو در اولین فصل رئال ۳۰ تا از این زد' },
      { word: 'اراده', clue: 'نیرویی که رونالدو را بر زخم‌ها پیروز کرد' },
      { word: 'برنابئو', clue: 'ورزشگاهی که هوادارانش عاشق رونالدو شدند' },
      { word: 'پدیده', clue: 'لقبی که تا ابد با رونالدو نازاریو می‌ماند' },
    ],
    bgEmoji: '👑',
  },
];

// ─── PAOLO MALDINI (ایتالیا) ───────────────────────────
// 4 فصل از زندگی «دیوار جاودان روسونری»

export const MALDINI_CHAPTERS: WorldMapChapter[] = [
  {
    id: 'maldini_debut',
    legendId: 'maldini',
    chapterIndex: 0,
    title: { fa: 'وارث روسونری', en: 'Heir to the Rossoneri' },
    subtitle: { fa: 'پسری از خانواده‌ای افسانه‌ای', en: 'A Boy from a Legendary Family' },
    story: {
      fa: `۲۶ ژوئن ۱۹۶۸، در میلان، پائولو مالدینی به دنیا آمد؛ پسری که از بدو تولد در خانواده‌ای فوتبالی رشد کرد. پدرش چزاره مالدینی، کاپیتان و افسانه‌ی میلان و تیم ملی ایتالیا بود.

پائولو از ۱۰ سالگی به آکادمی میلان پیوست. اما پدرش هرگز او را به‌خاطر نام خانوادگی‌اش تحسین نکرد؛ برعکس، فشار را بیشتر کرد تا ثابت کند که خودش باید شایستگی‌اش را نشان دهد.

در ۲۰ ژانویه ۱۹۸۵، در ۱۶ سالگی، اولین بازی‌اش را برای میلان انجام داد. همان شب، تماشاگران فهمیدند که نسل دومی از مالدینی‌ها آمده است؛ جوانی با آرامش پدر و اراده‌ای دوچندان.`,
      en: `On June 26, 1968, in Milan, Paolo Maldini was born — a boy raised from birth in a footballing family. His father Cesare Maldini was a captain and legend of Milan and the Italian national team.

Paolo joined the Milan academy at 10. But his father never praised him for his surname; on the contrary, he increased the pressure so Paolo would prove his own worth.

On January 20, 1985, at 16, he made his debut for Milan. That night the fans understood a second generation of Maldinis had arrived — a youth with his father's calm and double the resolve.`
    },
    victoryText: {
      fa: 'پیراهن راه‌راه میلان را می‌پوشی و وارد سن‌سیرو می‌شوی. تماشاگران نام خانوادگی‌ات را فریاد می‌زنند و تو با اولین تکل، ثابت می‌کنی که شایسته‌ی این نام هستی.',
      en: 'You pull on Milan\'s striped shirt and step into San Siro. The crowd chants your surname and with your first tackle you prove you are worthy of the name.'
    },
    year: '1968-1985',
    words: [
      { word: 'مالدینی', clue: 'نام خانوادگی افسانه‌ای که پائولو و پدرش داشتند' },
      { word: 'میلان', clue: 'شهر و باشگاهی که مالدینی تمام عمرش را در آن گذراند' },
      { word: 'چزاره', clue: 'نام پدر پائولو، کاپیتان افسانه‌ای میلان' },
      { word: 'کاپیتان', clue: 'نقشی که پدر مالدینی در میلان و تیم ملی داشت' },
      { word: 'آکادمی', clue: 'جایی که پائولو از ۱۰ سالگی آموزش دید' },
      { word: 'روسونری', clue: 'لقب میلان به معنای سرخ‌و‌سیاه‌ها' },
      { word: 'سن‌سیرو', clue: 'ورزشگاه میلان که مالدینی در آن اولین بازی‌اش را کرد' },
      { word: 'فشار', clue: 'چیزی که پدر مالدینی با نام خانوادگی بر پسرش آورد' },
      { word: 'تکل', clue: 'حرکت دفاعی که مالدینی در اولین بازی‌اش زد' },
      { word: 'اراده', clue: 'ویژگی پائولو که دوچندانِ پدرش بود' },
    ],
    bgEmoji: '🔴',
  },
  {
    id: 'maldini_sacchi',
    legendId: 'maldini',
    chapterIndex: 1,
    title: { fa: 'دیوار میلانِ ساکی', en: 'The Wall of Sacchi\'s Milan' },
    subtitle: { fa: 'میلانِ شکست‌ناپذیر', en: 'The Invincible Milan' },
    story: {
      fa: `در پایان دهه‌ی ۱۹۸۰، آریگو ساکی مربی میلان شد و یکی از بزرگ‌ترین تیم‌های تاریخ فوتبال را ساخت. مالدینی در قلب این تیم، در جناح چپ دفاع، به دیواری تبدیل شد که کمتر کسی از آن می‌گذشت.

میلان با رهبری مالدینی، دو جام اروپا را پشت سر هم برد (۱۹۸۹ و ۱۹۹۰) و در فینال ۱۹۸۹ با نتیجه‌ی ۴-۰ استوا بخارست را در هم کوبید. مالدینی نه فقط مدافع، بلکه آغازگر حملات بود؛ او با پاس‌های دقیق و پیشروی‌های حساب‌شده، نسل جدیدی از مدافعان مدرن را معرفی کرد.

در سال ۱۹۹۴، مجله‌ی معتبری او را بهترین مدافع جهان نامید. مالدینی نشان داد که دفاع کردن هم می‌تواند هنر باشد، نه فقط زور.`,
      en: `At the end of the 1980s Arrigo Sacchi became Milan's coach and built one of the greatest teams in football history. At its heart, on the left of defense, Maldini became a wall few could pass.

Under Maldini's leadership Milan won two consecutive European Cups (1989 and 1990) and crushed Steaua Bucharest 4-0 in the 1989 final. Maldini was not only a defender but the initiator of attacks; with precise passes and measured surges he introduced a new generation of modern defenders.

In 1994 a prestigious magazine named him the world's best defender. Maldini showed that defending, too, could be art rather than mere force.`
    },
    victoryText: {
      fa: 'جام اروپا را پشت سر هم بالا می‌بری و مهاجمان بزرگ در برابر دیوار تو به زانو درمی‌آیند. سن‌سیرو فریاد می‌زند: مالدینی! دیوار میلان هرگز فرو نمی‌ریزد.',
      en: 'You lift the European Cup in successive years and great forwards fall to their knees against your wall. San Siro roars: Maldini! The wall of Milan never falls.'
    },
    year: '1985-1996',
    words: [
      { word: 'ساکی', clue: 'مربی ایتالیایی که میلان شکست‌ناپذیر را ساخت' },
      { word: 'جام', clue: 'جام اروپا که مالدینی دو بار پیاپی با میلان برد' },
      { word: 'استوا', clue: 'تیمی که میلان در فینال ۱۹۸۹ با نتیجه ۴-۰ شکست داد' },
      { word: 'جناح', clue: 'سمت چپ دفاع که قلمرو مالدینی بود' },
      { word: 'مدافع', clue: 'پست اصلی مالدینی که آن را به هنر تبدیل کرد' },
      { word: 'حملات', clue: 'مالدینی نه فقط مدافع، بلکه آغازگر این‌ها بود' },
      { word: 'دیوار', clue: 'لقبی که برای خط دفاع مالدینی به کار می‌رفت' },
      { word: 'فینال', clue: 'بازی نهایی جام اروپا ۱۹۸۹' },
      { word: 'پاس', clue: 'ابزار مالدینی برای ساختن حملات از عقب' },
      { word: 'مدرن', clue: 'نسل جدیدی از مدافعان که مالدینی معرفی کرد' },
    ],
    bgEmoji: '🧱',
  },
  {
    id: 'maldini_captain',
    legendId: 'maldini',
    chapterIndex: 2,
    title: { fa: 'کاپیتانِ پنج جام', en: 'Captain of Five European Cups' },
    subtitle: { fa: '۲۵ سال، یک پیراهن', en: '25 Years, One Shirt' },
    story: {
      fa: `مالدینی در سال ۱۹۹۷ بازوبند کاپیتانی میلان را به ارث برد؛ افتخاری که پیش از او از آنِ پدرش هم بود. او ۲۵ سال فقط برای یک باشگاه بازی کرد؛ وفاداری‌ای که در فوتبال مدرن کمیاب است.

در سال ۲۰۰۳ و ۲۰۰۷، دو جام اروپای دیگر را بالای سر برد. فینال ۲۰۰۵ استانبول در برابر لیورپول را باخت، اما دو سال بعد، در آتن، انتقام گرفت و پنجمین جام اروپای خود را برد؛ رکوردی که تنها چند بازیکن به آن رسیده‌اند.

مالدینی در مجموع ۹۰۲ بازی برای میلان انجام داد و ۲۶ جام برد. او در ۴۱ سالگی خداحافظی کرد و هواداران در سن‌سیرو، برای آخرین بار، نام او را با احترام فریاد زدند.`,
      en: `In 1997 Maldini inherited Milan's captaincy — an honor that had also belonged to his father. He played 25 years for a single club, a loyalty rare in modern football.

In 2003 and 2007 he lifted two more European Cups. He lost the 2005 Istanbul final to Liverpool but two years later, in Athens, took revenge and won his fifth European Cup — a record reached by only a handful of players.

In total Maldini made 902 appearances for Milan and won 26 trophies. He retired at 41 and the San Siro crowd, one last time, chanted his name in respect.`
    },
    victoryText: {
      fa: 'در آتن جام پنجم را بالای سر می‌بری و بازوبند کاپیتانی بر بازوست. هواداران می‌دانند که چنین وفاداری‌ای دیگر تکرار نخواهد شد. کاپیتان، تو تاریخ را با یک پیراهن نوشتی.',
      en: 'In Athens you lift your fifth cup, the captain\'s armband on your arm. The fans know such loyalty will never come again. Captain, you wrote history with a single shirt.'
    },
    year: '1997-2009',
    words: [
      { word: 'کاپیتان', clue: 'بازوبندی که مالدینی در ۱۹۹۷ از پدرش به ارث برد' },
      { word: 'استانبول', clue: 'شهری که میلان فینال ۲۰۰۵ را در آن به لیورپول باخت' },
      { word: 'آتن', clue: 'شهری که مالدینی در ۲۰۰۷ انتقام گرفت' },
      { word: 'لیورپول', clue: 'حریف میلان در فینال‌های ۲۰۰۵ و ۲۰۰۷' },
      { word: 'وفاداری', clue: 'ویژگی مالدینی که ۲۵ سال به یک باشگاه ماند' },
      { word: 'جام', clue: 'مالدینی پنج بار این جام را در اروپا برد' },
      { word: 'بازی', clue: 'مالدینی ۹۰۲ بار برای میلان این کار را کرد' },
      { word: 'جام‌ها', clue: 'مالدینی در مجموع ۲۶ تا از این برد' },
      { word: 'خداحافظی', clue: 'کاری که مالدینی در ۴۱ سالگی کرد' },
      { word: 'رکورد', clue: 'پنج جام اروپا رکوردی است که کم‌کسی به آن رسید' },
    ],
    bgEmoji: '🎖️',
  },
  {
    id: 'maldini_legacy',
    legendId: 'maldini',
    chapterIndex: 3,
    title: { fa: 'میراث مالدینی', en: 'The Maldini Legacy' },
    subtitle: { fa: 'نامی که سه نسل ادامه یافت', en: 'A Name Carried Through Three Generations' },
    story: {
      fa: `مالدینی در سال ۲۰۰۹ از فوتبال خداحافظی کرد، اما داستان خانواده‌اش ادامه یافت. پسرش دانیل مالدینی نیز پیراهن میلان را پوشید و نسل سوم مالدینی‌ها در روسونری ظاهر شد.

پائولو پس از بازنشستگی به مدیریت میلان بازگشت و در ساختن تیمی که در ۲۰۲۲ قهرمان ایتالیا شد، نقشی کلیدی داشت. اما هواداران او را بیش از هر چیز به‌عنوان مدافع جاودان به یاد می‌آورند.

میراث مالدینی فقط جام‌ها نبود؛ او نماد وفاداری، انضباط و ظرافت در دفاع بود. کسی که ثابت کرد می‌توان عمری در یک باشگاه ماند و در همان حال، به همه‌ی افتخارات رسید.`,
      en: `Maldini retired in 2009, but his family's story continued. His son Daniel also wore the Milan shirt and a third generation of Maldinis appeared at the Rossoneri.

After retirement Paolo returned to Milan's management and played a key role in building the team that won the Italian title in 2022. But fans remember him above all as an immortal defender.

The Maldini legacy was not only trophies; he was a symbol of loyalty, discipline and elegance in defense. A man who proved you can spend a lifetime at one club and still reach every honor.`
    },
    victoryText: {
      fa: 'پس از ۲۵ سال از زمین بیرون می‌روی و سن‌سیرو ایستاده تو را بدرقه می‌کند. پسرت پیراهن همان باشگاه را می‌پوشد و نام مالدینی سه نسل ادامه می‌یابد. تو وفاداری را جاودانه کردی.',
      en: 'After 25 years you leave the pitch and San Siro stands to see you off. Your son wears the same club\'s shirt and the Maldini name continues through three generations. You made loyalty immortal.'
    },
    year: '2009-2022',
    words: [
      { word: 'دانیل', clue: 'پسر پائولو مالدینی که او هم برای میلان بازی کرد' },
      { word: 'نسل', clue: 'مالدینی‌ها سه ... در میلان داشتند' },
      { word: 'مدیریت', clue: 'نقشی که مالدینی پس از بازنشستگی در میلان گرفت' },
      { word: 'قهرمانی', clue: 'میلان در ۲۰۲۲ با نقش مالدینی این را در ایتالیا برد' },
      { word: 'جاودان', clue: 'وصفی که برای مالدینی به‌عنوان مدافع به کار می‌رود' },
      { word: 'انضباط', clue: 'ویژگی مالدینی در کنار وفاداری و ظرافت' },
      { word: 'ظرافت', clue: 'ویژگی دفاع کردن مالدینی' },
      { word: 'وفاداری', clue: 'میراث اصلی مالدینی برای فوتبال' },
      { word: 'سن‌سیرو', clue: 'ورزشگاهی که مالدینی را ایستاده بدرقه کرد' },
      { word: 'افتخار', clue: 'مالدینی به همه این‌ها در یک باشگاه رسید' },
    ],
    bgEmoji: '🏛️',
  },
];

export const OLD_LEGENDS_A_CHAPTERS: Record<string, WorldMapChapter[]> = {
  cruyff: CRUYFF_CHAPTERS,
  beckenbauer: BECKENBAUER_CHAPTERS,
  ronaldinho: RONALDINHO_CHAPTERS,
  ronaldo9: RONALDO9_CHAPTERS,
  maldini: MALDINI_CHAPTERS,
};

export const OLD_LEGENDS_A_FINAL: Record<string, { fa: string; en: string }> = {
  cruyff: {
    fa: `یوهان کرویف فقط یک بازیکن نبود؛ او معمار یک اندیشه بود. از زمین خاکی بتوندورپ تا نیمکت بارسلونا، او ثابت کرد که فوتبال را می‌توان با مغز بازی کرد، نه فقط با پا.

فوتبال توتال، چرخش معروف، و آکادمی لاماسیا؛ همه‌ی این‌ها میراث پسر شماره ۱۴ است. کرویف به جهان آموخت که زیبایی و پیروزی می‌توانند هم‌زمان باشند.

«شماره ۱۴» هرگز نمی‌میرد؛ او در هر پاس کوتاه و هر حرکت تیمی زنده است.`,
    en: `Johan Cruyff was not merely a player; he was the architect of an idea. From the dirt pitch of Betondorp to the Barcelona bench, he proved football could be played with the brain, not just the feet.

Total Football, the Cruyff Turn, and the La Masia academy; all are the legacy of the boy in number 14. Cruyff taught the world that beauty and victory can coexist.

"Number 14" never dies; he lives in every short pass and every team movement.`
  },
  beckenbauer: {
    fa: `فرانتس بکن‌باوئر، از میان آوارهای مونیخ برخاست و به قیصر فوتبال آلمان تبدیل شد. او هم به‌عنوان بازیکن و هم به‌عنوان سرمربی قهرمان جهان شد؛ شاهکاری که تنها او و یکی دیگر به آن رسیدند.

لیبرو، رهبری آرام و آن وقار اشرافی، بکن‌باوئر را به نمادی از انضباط و عظمت آلمان تبدیل کرد.

«قیصر» هرگز فراموش نمی‌شود؛ نام او با تاریخ فوتبال گره خورده است.`,
    en: `Franz Beckenbauer rose from the rubble of Munich to become the Kaiser of German football. He became world champion both as a player and as a coach — a feat achieved by only him and one other.

The libero, the calm leadership and that aristocratic dignity made Beckenbauer a symbol of German discipline and greatness.

The "Kaiser" will never be forgotten; his name is bound to the history of football.`
  },
  ronaldinho: {
    fa: `رونالدینیو به جهان یاد داد که فوتبال می‌تواند جشن باشد. او با لبخند همیشگی‌اش، در نیوکمپ جادو کرد و حتی تماشاگران رئال را وادار به ایستادن کرد.

توپ طلا، جام قهرمانان و هزاران حرکت جادویی؛ اما بزرگ‌ترین دستاورد او شادی بود. او نشان داد که می‌توان برنده شد و در همان حال، لبخند زد.

«جادوگر» هرگز از یادها نمی‌رود؛ لبخندش در قلب فوتبال حک شده است.`,
    en: `Ronaldinho taught the world that football can be a celebration. With his everlasting smile he worked magic at the Camp Nou and even made Real's fans stand.

The Ballon d'Or, the Champions League and thousands of magical moves; yet his greatest achievement was joy. He showed you can win and, at the same time, smile.

The "Magician" will never be forgotten; his smile is carved into the heart of football.`
  },
  ronaldo9: {
    fa: `رونالدو نازاریو، «پدیده»، ترکیبی بی‌همتا از سرعت، قدرت و تکنیک بود. او دو بار جام جهانی برد، توپ طلا گرفت و پس از دو مصدومیت سنگین، بازگشت و در ۲۰۰۲ جهان را مسحور کرد.

داستان او، داستان پیروزی اراده بر درد است. او ثابت کرد که پس از هر سقوط، می‌توان دوباره برخاست.

«پدیده» تا ابد در یادها می‌ماند؛ مهاجمی که فوتبال مانند او کمتر به خود دیده است.`,
    en: `Ronaldo Nazário, "O Fenômeno," was a unique blend of speed, power and technique. He won two World Cups, took the Ballon d'Or and, after two severe injuries, returned to mesmerize the world in 2002.

His story is one of will triumphing over pain. He proved that after every fall one can rise again.

"O Fenômeno" endures forever; a striker the like of whom football has rarely seen.`
  },
  maldini: {
    fa: `پائولو مالدینی، دیوار جاودان روسونری، ۲۵ سال فقط برای یک باشگاه بازی کرد. پنج جام اروپا، ۲۶ جام و ۹۰۲ بازی؛ اما بزرگ‌ترین افتخار او وفاداری بود.

او دفاع کردن را به هنر تبدیل کرد و نشان داد که می‌توان عمری در یک خانه ماند و به همه‌ی قله‌ها رسید.

نام مالدینی، مترادف وفاداری و ظرافت است؛ میراثی که سه نسل ادامه یافت.`,
    en: `Paolo Maldini, the immortal wall of the Rossoneri, played 25 years for a single club. Five European Cups, 26 trophies and 902 appearances; yet his greatest honor was loyalty.

He turned defending into art and showed you can spend a lifetime in one home and reach every summit.

The name Maldini is synonymous with loyalty and elegance; a legacy carried through three generations.`
  },
};
