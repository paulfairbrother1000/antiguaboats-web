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
