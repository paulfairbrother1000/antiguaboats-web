import { NextResponse } from 'next/server';
import { seatInventory,dateRange } from '@/lib/perSeatServer';
export const dynamic='force-dynamic';
export async function GET(req:Request){
 const p=new URL(req.url).searchParams,from=p.get('from')??p.get('date'),to=p.get('to')??from;
 if(!dateRange(from,to))return NextResponse.json({error:'Valid date or from/to range is required'},{status:400});
 try{return NextResponse.json({trips:await seatInventory(from!,to!)},{headers:{'Cache-Control':'no-store'}});}
 catch{return NextResponse.json({error:'Unable to load seat availability'},{status:503});}
}
