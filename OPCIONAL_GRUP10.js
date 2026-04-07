db.videos.createIndex({ tipus: 1, ref_assignatura: 1, total_visualitzacions: -1 })

db.videos.find({
  "tipus": "problema",
  "ref_assignatura": "IniProg"
}).sort({ 
  "total_visualitzacions": -1 
})