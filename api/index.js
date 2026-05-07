"use strict";

module.exports = function handler(req, res) {
  res.status(200).json({
    ok: true,
    env: {
      SUPABASE_URL: process.env.SUPABASE_URL ? "set" : "MISSING",
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? "set" : "MISSING",
      AUTHENTICA_API_KEY: process.env.AUTHENTICA_API_KEY ? "set" : "MISSING",
    },
  });
};
