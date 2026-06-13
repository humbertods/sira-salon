const MESES_NOMBRES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function getWeekRange(){
  const now = new Date();
  const day = now.getDay();
  const start = new Date(now);
  start.setDate(now.getDate() - day + (day===0?-6:1));
  start.setHours(0,0,0,0);
  const end = new Date(start);
  end.setDate(start.getDate()+6);
  return {start, end};
}

function getMonthRange(){
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth()+1, 0);
  return {start, end};
}
