const jwt = require('jsonwebtoken');
const supabase = require('../supabase/client');
const prisma = require('../prisma/client');

const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  // 1. Verify standard app JWT token
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (jwtErr) {
    // 2. Fallback: verify direct Supabase access token if passed
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.getUser(token);
        if (!error && data?.user) {
          const dbUser = await prisma.user.findFirst({
            where: {
              OR: [
                { id: data.user.id },
                { email: data.user.email }
              ]
            }
          });
          if (dbUser) {
            req.user = {
              id: dbUser.id,
              email: dbUser.email,
              display_name: dbUser.display_name,
              avatar_id: dbUser.avatar_id
            };
            return next();
          }
        }
      } catch (sbErr) {
        // Continue to unauthorized response
      }
    }
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

module.exports = authMiddleware;
