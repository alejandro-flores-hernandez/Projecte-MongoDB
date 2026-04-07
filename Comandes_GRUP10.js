"""CONSULTES PROJECTE MONGO GRUP 10"""

"""1- Rànquing de vídeos més visualitzats. Mostra el títol i descripció del vídeo i el total vegades visualitzats."""

db.videos.aggregate([
  { 
    $sort: { total_visualitzacions: -1 } 
  },
  { 
    $project: { 
      _id: 0, 
      ref_titol: 1, 
      descripcio: 1, 
      total_visualitzacions: 1 
    } 
  },
  {$limit: 10}
])
"""2- Rànquing de vídeos més valorats. Mostra el títol i descripció del vídeo i nota mitjana en les puntuacions. Ordeneu els resultats per nota mitjana ascendent."""
db.videos.aggregate([
  { 
    $sort: { puntuacio_mitjana: 1 } 
  },
  { 
    $project: { 
      _id: 0, 
      ref_titol: 1, 
      descripcio: 1, 
      puntuacio_mitjana: 1 
    } 
  },
  {$limit: 10}
])

"""3- Feu la consulta de visualització d’un vídeo concret. Mostreu els atributs de vídeo, informació completa de l’usuari que el crea, puntuació mitjana, número de comentaris i número de vídeos resposta."""

db.videos.aggregate([
  { $match: { codi_id: "VID_001" } },
  {
    $lookup: {
      from: "usuaris",
      localField: "ref_autor.niu",
      foreignField: "niu_id",
      as: "dades_autor_complet"
    }
  },
  {
    $project: {
      codi_id: 1,
      ref_titol: 1,
      descripcio: 1,
      puntuacio_mitjana: 1,
      total_comentaris: 1,
      numero_respostes: { $size: "$solucions" },
      dades_autor_complet: { $arrayElemAt: ["$dades_autor_complet", 0] }
    }
  }
])

"""4- Nombre de vídeos de plantejament de problemes per professor i per assignatura (els dos resultats en la mateixa consulta). """

db.videos.aggregate([
  { $match: { tipus: "problema" } },
  {
    $group: {
      _id: { professor: "$ref_autor.nom", assignatura: "$ref_assignatura" },
      total_videos: { $sum: 1 }
    }
  }
])

"""5- Alumne que comenta més vegades. Mostreu el DNI."""

db.comentaris.aggregate([
  {
    $group: {
      _id: "$ref_usuari.niu",
      total_comentaris: { $sum: 1 }
    }
  },
  { $sort: { total_comentaris: -1 } },
  { $limit: 1 },
  { $project: { dni_niu: "$_id", _id: 0 } }
])
"""6- Mostrar els comentaris d’un vídeo concret ordenats cronològicament. Mostreu dades del vídeo, dades d’usuari que crea el vídeo, data dels comentaris, nota, comentaris i usuaris que han fer els comentaris. """

db.videos.aggregate([
  { $match: { codi_id: "VID_001" } },
  {
    $lookup: {
      from: "comentaris",
      localField: "codi_id",
      foreignField: "ref_code_video",
      as: "llista_comentaris"
    }
  },
  { $unwind: "$llista_comentaris" },
  { $sort: { "llista_comentaris.data": 1 } },
  {
    $project: {
      _id: 0,
      titol_video: "$ref_titol",
      autor_video: "$ref_autor.nom",
      data_comentari: "$llista_comentaris.data",
      nota: "$llista_comentaris.puntuacio",
      text_comentari: "$llista_comentaris.comentari",
      usuari_comenta: "$llista_comentaris.ref_usuari.nom"
    }
  }
])
"""7- Alumnes que no han pujat cap vídeo. Mostra les dades de l’alumne. """
db.usuaris.aggregate([
  { $match: { tipus: "estudiant" } },
  {
    $lookup: {
      from: "videos",
      localField: "niu_id",       
      foreignField: "ref_autor.niu", 
      as: "llista_videos"
    }
  },
  { 
    $match: { 
      "llista_videos": { $size: 0 } 
    } 
  },
  { 
    $project: { 
      llista_videos: 0,
      contrasenya: 0 
    } 
  }
])