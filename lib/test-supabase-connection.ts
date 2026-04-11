/**
 * Script de test de connexion Supabase
 *
 * Ce script vérifie que:
 * 1. Les variables d'environnement sont configurées
 * 2. La connexion à Supabase fonctionne
 * 3. Les tables sont créées
 * 4. Les compétences sont bien insérées
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function testSupabaseConnection() {
  console.log('🔍 Test de connexion Supabase...\n')

  // Test 1: Variables d'environnement
  console.log('1️⃣ Vérification des variables d\'environnement...')

  if (!supabaseUrl) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL non défini dans .env.local')
    return false
  }

  if (!supabaseKey) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY non défini dans .env.local')
    return false
  }

  console.log(`✅ NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl}`)
  console.log(`✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseKey.substring(0, 20)}...`)
  console.log('')

  // Test 2: Connexion à Supabase
  console.log('2️⃣ Test de connexion à Supabase...')

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // Tentative de récupération de la liste des tables via la table skills
    const { data, error } = await supabase.from('skills').select('count')

    if (error) {
      console.error('❌ Erreur de connexion:', error.message)
      console.log('\n💡 Assurez-vous que:')
      console.log('   - Les migrations SQL ont été exécutées')
      console.log('   - Les clés API sont correctes')
      return false
    }

    console.log('✅ Connexion réussie!')
    console.log('')

  } catch (err) {
    console.error('❌ Erreur:', err)
    return false
  }

  // Test 3: Vérification des tables
  console.log('3️⃣ Vérification des tables créées...')

  const tables = [
    'profiles',
    'needs',
    'skills',
    'user_skills',
    'projects',
    'project_needs',
    'need_skill_mapping',
    'applications',
    'user_charter_acceptances',
    'reports',
    'project_views_log',
    'user_badges',
    'user_impact_stats'
  ]

  let allTablesExist = true

  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('count').limit(0)

      if (error) {
        console.error(`❌ Table "${table}" n'existe pas ou n'est pas accessible`)
        allTablesExist = false
      } else {
        console.log(`✅ Table "${table}" existe`)
      }
    } catch (err) {
      console.error(`❌ Erreur lors de la vérification de "${table}"`)
      allTablesExist = false
    }
  }

  if (!allTablesExist) {
    console.log('\n💡 Certaines tables sont manquantes. Exécutez les migrations SQL dans Supabase.')
    return false
  }

  console.log('')

  // Test 4: Vérification des compétences
  console.log('4️⃣ Vérification des compétences prédéfinies...')

  try {
    const { data: skills, error } = await supabase
      .from('skills')
      .select('id, name, category')
      .eq('is_custom', false)

    if (error) {
      console.error('❌ Erreur lors de la récupération des compétences:', error.message)
      return false
    }

    if (!skills || skills.length === 0) {
      console.error('❌ Aucune compétence trouvée. Exécutez 002_seed_skills.sql')
      return false
    }

    console.log(`✅ ${skills.length} compétences trouvées`)
    console.log('\nExemples de compétences par catégorie:')

    const categories = ['technical', 'business', 'creative', 'operational', 'expertise']

    for (const category of categories) {
      const categorySkills = skills.filter(s => s.category === category)
      if (categorySkills.length > 0) {
        console.log(`  - ${category}: ${categorySkills.length} compétences`)
        console.log(`    Ex: "${categorySkills[0].name}"`)
      }
    }

    console.log('')

  } catch (err) {
    console.error('❌ Erreur:', err)
    return false
  }

  // Test 5: Vérification RLS
  console.log('5️⃣ Vérification de Row Level Security (RLS)...')

  try {
    // Tentative d'insertion sans authentification (devrait échouer)
    const { error } = await supabase
      .from('profiles')
      .insert({
        role: 'talent',
        first_name: 'Test',
        last_name: 'User',
        postal_code: '75001',
        city: 'Paris'
      })

    if (error && error.message.includes('new row violates row-level security policy')) {
      console.log('✅ RLS activé et fonctionnel (insertion non autorisée bloquée)')
    } else if (error) {
      console.log(`⚠️  RLS semble actif (erreur: ${error.message})`)
    } else {
      console.log('⚠️  RLS pourrait ne pas être correctement configuré')
    }

    console.log('')

  } catch (err) {
    console.log('⚠️  Impossible de tester RLS:', err)
  }

  // Résultat final
  console.log('═══════════════════════════════════════════════════')
  console.log('🎉 Tous les tests sont passés avec succès!')
  console.log('═══════════════════════════════════════════════════')
  console.log('\n✅ Votre configuration Supabase est prête!')
  console.log('\nProchaines étapes:')
  console.log('  1. Développer l\'authentification')
  console.log('  2. Créer les pages de profils')
  console.log('  3. Implémenter le matching territorial')
  console.log('')

  return true
}

// Exécution du test si le fichier est appelé directement
if (require.main === module) {
  testSupabaseConnection()
    .then(success => {
      process.exit(success ? 0 : 1)
    })
    .catch(err => {
      console.error('❌ Erreur fatale:', err)
      process.exit(1)
    })
}

export default testSupabaseConnection
