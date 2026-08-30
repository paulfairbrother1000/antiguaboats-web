import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('Antigua Boats uses the single-key Pace V2 partner contract',()=>{
  const source=readFileSync('src/app/api/shuttle-routes/route.ts','utf8');
  assert.match(source,/PACE_PARTNER_BASE_URL/);
  assert.match(source,/PACE_OPERATOR_KEY/);
  assert.match(source,/x-pace-api-key/);
  assert.match(source,/\/api\/public\/partner\/shuttle-routes/);
  assert.doesNotMatch(source,/PACE_OPERATOR_ID|operator_id|x-operator-key/);
  assert.doesNotMatch(source,/bopvaaexicvdueidyvjd|WORKING_SUPABASE_HOST|normaliseSupabaseUrl/);
});

test('proxy sends the private key only to the HTTPS Pace production host',()=>{
  const source=readFileSync('src/app/api/shuttle-routes/route.ts','utf8');
  assert.match(source,/new URL/);
  assert.match(source,/protocol !== "https:"/);
  assert.match(source,/paceshuttles\.com/);
});

test('public Supabase images do not receive a project-specific credential',()=>{
  const source=readFileSync('src/app/api/img/route.ts','utf8');
  assert.doesNotMatch(source,/PACE_SUPABASE_ANON_KEY|headers\.apikey|Bearer \$\{anon\}/);
});
