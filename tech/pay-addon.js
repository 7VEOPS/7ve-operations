/* 7VE Tech Portal add-on: base pay card + "higher pay available" notices.
   Loaded by tech/index.html after the main script. Read-only. Shows no dollar amount for higher pay. */
(function(){
  var BASE={gen:33, skl:40};           // 7VE pay card: General Stagehand / AV Tech, per hour
  var AV=/(skilled|av tech|stream|ptz|camera|video|audio|lighting|\ba1\b|\ba2\b|\bv1\b|\bv2\b|\bl1\b|\bl2\b|crew chief|technical lead|specialist|designer|director)/i;
  var cache=null, loading=false;

  function money(n){ return '$'+Number(n).toFixed(0)+'/hr'; }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }

  async function load(){
    if(cache) return cache;
    if(loading) return null;
    loading=true;
    try{
      var sb=await getSupabaseClient();
      var email=(typeof currentProfile!=='undefined' && currentProfile && currentProfile.email) || '';
      if(!email){ var u=await sb.auth.getUser(); email=(u&&u.data&&u.data.user&&u.data.user.email)||''; }
      if(!email) throw new Error('no email');
      var sp=await sb.from('staff_people').select('id,title,skills,lead_skill,secondary_skills').ilike('email',email).limit(1);
      var me=(sp.data&&sp.data[0])||null;
      var kind='gen';
      if(me){
        var blob=[me.title,me.lead_skill,[].concat(me.skills||[]).join(' '),[].concat(me.secondary_skills||[]).join(' ')].join(' ');
        if(AV.test(blob)) kind='skl';
      }
      var base=BASE[kind];
      var notices=[];
      if(me){
        var cs=await sb.from('crew_schedules').select('id,event_name,data').order('created_at',{ascending:false}).limit(60);
        (cs.data||[]).forEach(function(r){
          var d=r.data||{};
          if(d.cancelled&&d.cancelled.on) return;
          var sp2=parseFloat(d.showPay)||0;
          if(!(sp2>base)) return;
          var mine=false;
          Object.keys(d.assign||{}).forEach(function(k){ (d.assign[k]||[]).forEach(function(s){ if(String(s.tech)===String(me.id)) mine=true; }); });
          if(mine) notices.push(r.event_name||'Upcoming show');
        });
      }
      cache={base:base, label:kind==='skl'?'AV Tech':'General Stagehand', notices:notices};
    }catch(e){ cache={error:true}; }
    loading=false;
    return cache;
  }

  function cardHtml(c){
    if(!c||c.error) return '';
    var h='<div id="pay-addon" class="card" style="margin:0 0 16px;">'
      +'<div style="font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--dim);margin-bottom:6px;">Your base pay</div>'
      +'<div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;"><span style="font-family:var(--display);font-size:34px;font-weight:700;color:var(--white);">'+money(c.base)+'</span><span style="color:var(--dim);font-size:13px;">'+esc(c.label)+' rate</span></div>'
      +'<div style="color:var(--dim);font-size:12px;margin-top:6px;line-height:1.5;">Base pay per hour. Some shows pay more when the budget allows.</div>';
    c.notices.forEach(function(n){
      h+='<div style="display:flex;gap:10px;align-items:flex-start;margin-top:12px;padding:10px 12px;border:1px solid #5a4210;background:rgba(232,163,61,.10);border-radius:8px;">'
        +'<span class="led led-amber led-pulse" style="margin-top:5px;"></span>'
        +'<div style="font-size:13px;line-height:1.45;"><b>Higher pay available</b><br><span style="color:var(--dim);">'+esc(n)+'. Your rate for this show is above base. 7VE will confirm it with you.</span></div></div>';
    });
    return h+'</div>';
  }

  async function paint(){
    if(typeof activeTab==='undefined' || (activeTab!=='finance' && activeTab!=='schedule')) return;
    var mc=document.getElementById('main-content'); if(!mc) return;
    var c=await load(); if(!c) return;
    if(typeof activeTab==='undefined' || (activeTab!=='finance' && activeTab!=='schedule')) return;
    var old=document.getElementById('pay-addon'); if(old) old.remove();
    var html=cardHtml(c); if(!html) return;
    var anchor=mc.querySelector('.section-head');
    if(anchor) anchor.insertAdjacentHTML('afterend',html); else mc.insertAdjacentHTML('afterbegin',html);
  }

  var orig=window.renderContent;
  if(typeof orig==='function'){
    window.renderContent=function(){
      var r=orig.apply(this,arguments);
      try{ paint(); }catch(e){}
      return r;
    };
  }
  window.__payAddonPaint=paint;
})();
