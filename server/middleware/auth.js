const { supabaseAdmin } = require('../supabaseAdmin');

// Middleware: اعتبارسنجی JWT توکن فرستاده شده از کلاینت
// کلاینت توکن رو از supabase.auth.getSession() میگیره و توی Authorization header میفرسته
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'توکن ارسال نشده' });
  }

  const token = authHeader.split(' ')[1];

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: 'توکن نامعتبر است' });
  }

  req.user = user;
  next();
}

module.exports = { authenticate };
