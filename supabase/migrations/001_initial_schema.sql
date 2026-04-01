-- PostureFix Database Schema
-- Run this in Supabase SQL Editor or via supabase db push

-- ==========================================
-- TABLES
-- ==========================================

-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'fr')),
  pain_zones TEXT[] NOT NULL DEFAULT '{}',
  initial_pain_level INTEGER NOT NULL DEFAULT 5 CHECK (initial_pain_level BETWEEN 1 AND 10),
  daily_duration INTEGER DEFAULT 3 CHECK (daily_duration IN (3, 5)),
  notification_time TIME DEFAULT '09:00',
  extra_lunch BOOLEAN DEFAULT false,
  extra_evening BOOLEAN DEFAULT false,
  strict_mode BOOLEAN DEFAULT false,
  subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'trial', 'active', 'expired')),
  current_phase INTEGER DEFAULT 1 CHECK (current_phase BETWEEN 1 AND 4),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Daily sessions
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed BOOLEAN DEFAULT false,
  exercises JSONB NOT NULL DEFAULT '[]',
  pain_before INTEGER CHECK (pain_before BETWEEN 1 AND 10),
  pain_after INTEGER CHECK (pain_after BETWEEN 1 AND 10),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Streaks (cached for performance)
CREATE TABLE IF NOT EXISTS streaks (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_completed_date DATE,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Pain history (denormalized for fast chart queries)
CREATE TABLE IF NOT EXISTS pain_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  pain_level INTEGER NOT NULL CHECK (pain_level BETWEEN 1 AND 10),
  context TEXT DEFAULT 'post_routine' CHECK (context IN ('post_routine', 'daily_check')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Exercise definitions (seeded, not user-generated)
CREATE TABLE IF NOT EXISTS exercises (
  id TEXT PRIMARY KEY,
  name_fr TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_fr TEXT NOT NULL,
  description_en TEXT NOT NULL,
  tips_fr TEXT,
  tips_en TEXT,
  duration_seconds INTEGER NOT NULL,
  target_zones TEXT[] NOT NULL,
  difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate')),
  phase INTEGER DEFAULT 1 CHECK (phase BETWEEN 1 AND 4),
  lottie_file TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- ==========================================
-- INDEXES
-- ==========================================

CREATE INDEX IF NOT EXISTS sessions_user_date ON sessions(user_id, date);
CREATE INDEX IF NOT EXISTS pain_logs_user_date ON pain_logs(user_id, date);

-- ==========================================
-- ROW LEVEL SECURITY
-- ==========================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE pain_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
DROP POLICY IF EXISTS "Users own data" ON users;
CREATE POLICY "Users own data" ON users
  FOR ALL USING (auth.uid() = auth_id);

-- Sessions: users see only their own
DROP POLICY IF EXISTS "Users own sessions" ON sessions;
CREATE POLICY "Users own sessions" ON sessions
  FOR ALL USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- Streaks: users see only their own
DROP POLICY IF EXISTS "Users own streaks" ON streaks;
CREATE POLICY "Users own streaks" ON streaks
  FOR ALL USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- Pain logs: users see only their own
DROP POLICY IF EXISTS "Users own pain logs" ON pain_logs;
CREATE POLICY "Users own pain logs" ON pain_logs
  FOR ALL USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- Exercises: everyone can read
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone reads exercises" ON exercises;
CREATE POLICY "Anyone reads exercises" ON exercises
  FOR SELECT USING (true);

-- ==========================================
-- SEED: EXERCISE LIBRARY (20 exercises)
-- ==========================================

INSERT INTO exercises (id, name_fr, name_en, description_fr, description_en, tips_fr, tips_en, duration_seconds, target_zones, difficulty, phase, lottie_file, sort_order)
VALUES
  ('neck-side-stretch', 'Étirement latéral du cou', 'Neck Side Stretch',
   'Penche doucement la tête vers l''épaule droite, puis gauche. Maintiens 15 secondes de chaque côté.',
   'Gently tilt your head toward your right shoulder, then left. Hold 15 seconds each side.',
   'Ne force pas. Laisse le poids de la tête faire le travail.',
   'Don''t force it. Let the weight of your head do the work.',
   30, ARRAY['neck'], 'beginner', 1, 'neck-side-stretch.json', 10),

  ('chin-tucks', 'Rentrée du menton', 'Chin Tucks',
   'Rentre le menton vers la gorge comme pour faire un double menton. Maintiens 3 secondes, répète.',
   'Pull your chin straight back toward your throat. Hold 3 seconds, repeat.',
   'Imagine qu''un fil tire l''arrière de ta tête vers le haut.',
   'Imagine a string pulling the back of your head upward.',
   45, ARRAY['neck'], 'beginner', 1, 'chin-tucks.json', 20),

  ('neck-rotation', 'Rotation du cou', 'Neck Rotation',
   'Tourne lentement la tête à droite puis à gauche. Maintiens 10 secondes de chaque côté.',
   'Slowly turn your head to the right, then to the left. Hold 10 seconds each side.',
   'Mouvement lent et contrôlé. Jamais de rotation complète à 360°.',
   'Slow and controlled. Never do full 360° rotations.',
   30, ARRAY['neck'], 'beginner', 1, 'neck-rotation.json', 30),

  ('upper-trapezius-stretch', 'Étirement du trapèze supérieur', 'Upper Trapezius Stretch',
   'Penche la tête vers l''épaule droite et place la main droite sur la tête pour augmenter l''étirement.',
   'Tilt your head to your right shoulder and place your right hand on your head to deepen the stretch.',
   'Garde l''épaule opposée basse et détendue.',
   'Keep the opposite shoulder low and relaxed.',
   45, ARRAY['neck', 'shoulders'], 'beginner', 1, 'upper-trapezius-stretch.json', 40),

  ('neck-flexion-extension', 'Flexion/extension du cou', 'Neck Flexion & Extension',
   'Baisse doucement le menton vers la poitrine, puis lève doucement le regard vers le plafond.',
   'Gently lower your chin to your chest, then slowly look up toward the ceiling.',
   'N''étire jamais le cou en arrière trop loin si tu as des cervicalgies.',
   'Don''t extend your neck too far back if you have cervical pain.',
   30, ARRAY['neck'], 'beginner', 1, 'neck-flexion-extension.json', 50),

  ('shoulder-rolls', 'Roulements des épaules', 'Shoulder Rolls',
   'Fais des cercles avec les épaules : 10 fois vers l''avant, 10 fois vers l''arrière.',
   'Roll your shoulders in circles: 10 times forward, 10 times backward.',
   'Fais des grands cercles, vraiment amplifiés.',
   'Make big, exaggerated circles.',
   30, ARRAY['shoulders'], 'beginner', 1, 'shoulder-rolls.json', 60),

  ('cross-body-shoulder', 'Étirement épaule croisé', 'Cross-Body Shoulder Stretch',
   'Tire le bras droit à travers la poitrine avec le bras gauche. Maintiens 20 secondes. Change de côté.',
   'Pull your right arm across your chest with your left arm. Hold 20 seconds. Switch sides.',
   'Garde l''épaule basse, ne la monte pas vers l''oreille.',
   'Keep your shoulder down, don''t shrug it up to your ear.',
   45, ARRAY['shoulders'], 'beginner', 1, 'cross-body-shoulder.json', 70),

  ('doorway-chest-stretch', 'Étirement pectoraux (embrasure)', 'Doorway Chest Stretch',
   'Place les avant-bras sur un cadre de porte, penche-toi doucement vers l''avant. Maintiens 30 secondes.',
   'Place your forearms on a doorframe, gently lean forward. Hold 30 seconds.',
   'Tu dois sentir l''étirement à l''avant de la poitrine, pas de douleur dans les épaules.',
   'You should feel the stretch in your chest, not pain in your shoulders.',
   60, ARRAY['shoulders', 'upper_back'], 'beginner', 1, 'doorway-chest-stretch.json', 80),

  ('shoulder-blade-squeezes', 'Serrage des omoplates', 'Shoulder Blade Squeezes',
   'Serre les omoplates ensemble comme si tu tenais un crayon entre elles. Maintiens 5 secondes, répète 8 fois.',
   'Squeeze your shoulder blades together as if holding a pencil between them. Hold 5 seconds, repeat 8 times.',
   'Garde les épaules basses. Ne hausse pas les épaules.',
   'Keep your shoulders down. Don''t shrug.',
   45, ARRAY['shoulders', 'upper_back'], 'beginner', 1, 'shoulder-blade-squeezes.json', 90),

  ('arm-circles', 'Cercles de bras', 'Arm Circles',
   'Étends les bras sur les côtés et fais des petits cercles vers l''avant pendant 15 secondes, puis vers l''arrière.',
   'Extend your arms to the sides and make small forward circles for 15 seconds, then backward.',
   'Commence par de petits cercles et augmente progressivement.',
   'Start with small circles and gradually increase the size.',
   30, ARRAY['shoulders'], 'beginner', 1, 'arm-circles.json', 100),

  ('cat-cow', 'Chat-vache', 'Cat-Cow Stretch',
   'À quatre pattes : expire en arrondissant le dos vers le plafond (chat), inspire en creusant le dos (vache).',
   'On all fours: exhale rounding your back up (cat), inhale arching it down (cow). Alternate slowly.',
   'Synchronise le mouvement avec ta respiration.',
   'Sync the movement with your breath.',
   60, ARRAY['upper_back', 'lower_back'], 'beginner', 1, 'cat-cow.json', 110),

  ('thoracic-rotation', 'Rotation thoracique', 'Thoracic Rotation',
   'Assis sur une chaise, croise les bras sur la poitrine et tourne lentement le buste à droite puis à gauche.',
   'Sitting in a chair, cross your arms over your chest and slowly rotate your torso right then left.',
   'Le mouvement vient du milieu du dos, pas des hanches.',
   'The movement comes from your mid-back, not your hips.',
   45, ARRAY['upper_back'], 'beginner', 1, 'thoracic-rotation.json', 120),

  ('thread-needle', 'Fil de l''aiguille', 'Thread the Needle',
   'À quatre pattes, glisse le bras droit sous le corps vers la gauche, en posant l''épaule au sol.',
   'On all fours, slide your right arm under your body to the left, resting your shoulder on the floor.',
   'La hanche reste levée, seule l''épaule et le bras descendent.',
   'Keep your hips raised—only your shoulder and arm go down.',
   60, ARRAY['upper_back', 'shoulders'], 'beginner', 1, 'thread-needle.json', 130),

  ('seated-spinal-twist', 'Torsion vertébrale assise', 'Seated Spinal Twist',
   'Assis sur une chaise, torse droit, tourne-toi vers la droite en saisissant le dossier.',
   'Sitting upright in a chair, rotate to your right, gripping the chair back. Hold 20 seconds. Switch.',
   'Expire à chaque torsion pour aller plus loin.',
   'Exhale as you twist to go deeper.',
   45, ARRAY['upper_back', 'lower_back'], 'beginner', 1, 'seated-spinal-twist.json', 140),

  ('upper-back-opening', 'Ouverture du dos supérieur', 'Upper Back Opening',
   'Assis sur une chaise, interlace les doigts derrière la tête, ouvre les coudes et penche-toi légèrement en arrière.',
   'Sitting in a chair, interlace your fingers behind your head, open your elbows and gently lean back.',
   'Ne force pas la tête en arrière. L''étirement est dans le dos, pas dans le cou.',
   'Don''t push your head back. The stretch is in your back, not your neck.',
   60, ARRAY['upper_back'], 'beginner', 1, 'upper-back-opening.json', 150),

  ('childs-pose', 'Posture de l''enfant', 'Child''s Pose',
   'À genoux, assois-toi sur les talons, étends les bras devant toi au sol. Maintiens et respire profondément.',
   'On your knees, sit back on your heels, extend your arms forward on the floor. Hold and breathe deeply.',
   'Laisse la gravité travailler. Relâche complètement le dos.',
   'Let gravity do the work. Completely relax your back.',
   60, ARRAY['lower_back', 'upper_back'], 'beginner', 1, 'childs-pose.json', 160),

  ('knee-to-chest', 'Genou vers la poitrine', 'Knee-to-Chest Stretch',
   'Allongé sur le dos, ramène un genou vers la poitrine avec les deux mains. Maintiens 20 secondes. Change de côté.',
   'Lying on your back, pull one knee toward your chest with both hands. Hold 20 seconds. Switch.',
   'Garde l''autre jambe allongée au sol ou légèrement fléchie.',
   'Keep the other leg extended or slightly bent on the floor.',
   45, ARRAY['lower_back'], 'beginner', 1, 'knee-to-chest.json', 170),

  ('pelvic-tilts', 'Bascules pelviennes', 'Pelvic Tilts',
   'Allongé sur le dos, genoux fléchis : aplatit les lombaires contre le sol puis creuse-les. Alterne lentement 10 fois.',
   'Lying on your back, knees bent: flatten your lower back to the floor then arch it. Alternate slowly 10 times.',
   'Mouvement subtil — quelques centimètres seulement.',
   'Subtle movement — only a few centimeters.',
   45, ARRAY['lower_back'], 'beginner', 1, 'pelvic-tilts.json', 180),

  ('supine-spinal-twist', 'Torsion vertébrale allongée', 'Supine Spinal Twist',
   'Allongé sur le dos, ramène le genou droit vers la gauche en gardant les épaules au sol.',
   'Lying on your back, bring your right knee across to the left while keeping your shoulders on the floor.',
   'Expire pour relâcher davantage dans la torsion.',
   'Exhale to release deeper into the twist.',
   60, ARRAY['lower_back', 'upper_back'], 'beginner', 1, 'supine-spinal-twist.json', 190),

  ('standing-forward-fold', 'Flexion avant debout', 'Standing Forward Fold',
   'Debout, pieds à largeur de hanches, penche-toi en avant et laisse les bras et la tête pendre vers le sol.',
   'Standing, feet hip-width apart, fold forward and let your arms and head hang toward the floor.',
   'Genoux légèrement fléchis si nécessaire. Ne cherche pas à toucher le sol.',
   'Knees slightly bent if needed. Don''t try to touch the floor.',
   45, ARRAY['lower_back'], 'beginner', 1, 'standing-forward-fold.json', 200)

ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- UPDATED_AT TRIGGER
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
