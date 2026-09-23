const { createClient } = require("@supabase/supabase-js");
const User = require("../models/User");

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

const protect = async (req, res, next) => {
  try {

    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {

      token = req.headers.authorization.split(" ")[1];

      const { data, error } = await supabase.auth.getUser(token);

      if (error || !data.user) {
        return res.status(401).json({ message: "Not authorized" });
      }

      const authUser = data.user;
      const name = authUser.user_metadata?.name || authUser.email;

      req.user = await User.findOneAndUpdate(
        { supabaseId: authUser.id },
        {
          $set: { name, email: authUser.email },
          $setOnInsert: { supabaseId: authUser.id },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      ).select("-password");

      next();

    } else {

      return res.status(401).json({
        message: "Not authorized, no token"
      });

    }

  } catch (error) {

    return res.status(401).json({
      message: "Not authorized"
    });

  }
};

module.exports = { protect };