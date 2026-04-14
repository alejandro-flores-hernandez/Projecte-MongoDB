"""CONSULTES PROJECTE MONGO GRUP 10"""

"""1- Rànquing de vídeos més visualitzats. Mostra el títol i descripció del vídeo i el total vegades visualitzats."""

db.videos.find({}, {titol: 1, descripcio: 1, total_visualitzacions: 1, _id: 0}).sort({total_visualitzacions: -1}).limit(5)



"""2- Rànquing de vídeos més valorats. Mostra el títol i descripció del vídeo i nota mitjana en les puntuacions. Ordeneu els resultats per nota mitjana ascendent."""

db.videos.aggregate([
    {$project: {titol: 1, descripcio: 1, puntuacio_mitjana: 1, _id: 0}},
    {$sort: {puntuacio_mitjana: -1}}, 
    {$limit: 5}, 
    {$sort: {puntuacio_mitjana: 1}}
])



"""3- Feu la consulta de visualització d’un vídeo concret. Mostreu els atributs de vídeo, informació completa de l’usuari que el crea, puntuació mitjana, número de comentaris i número de vídeos resposta."""

db.videos.aggregate([
  {$match: {_id: "P1"}},
  {$lookup: {
      from: "usuaris",
      localField: "autor.niu",
      foreignField: "_id",
      as: "autor"
  }},
  {$unwind: "$autor"},
  {$project: {
      titol: 1,
      descripcio: 1,
      tipus: 1,
      autor_video: {
          niu: "$autor._id",
          nom: "$autor.nom",
          correu: "$autor.correu",
          pais: "$autor.pais",
          tipus: "$autor.tipus"
    },
      puntuacio_mitjana: 1,
      total_comentaris: 1,
      num_videos_resposta: {$size: "$solucions"}
  }}
])



"""4- Nombre de vídeos de plantejament de problemes per professor i per assignatura (els dos resultats en la mateixa consulta). """

db.videos.aggregate([
  {$match: {tipus: "problema"}},
  {$group: {_id: {niu: "$autor.niu", assignatura: "$assignatura"}, total_videos: {$sum: 1}, professor: {$first: "$autor.nom"}}}
])



"""5- Alumne que comenta més vegades. Mostreu el DNI."""

db.usuaris.aggregate([
  {$match: {tipus: "estudiant"}},
  {$lookup: {
         from: "comentaris",
         localField: "_id",
         foreignField: "usuari.niu",
         as: "comentari"
  }},
  {$unwind: "$comentari"},
  {$group: {_id: "$comentari.usuari.niu", total_comentaris: {$sum: 1}, nom: {$first: "$nom"}}},
  {$sort: {total_comentaris: -1}},
  {$limit: 1},
  {$project: {_id: 0, niu: "$_id", nom: 1, total_comentaris: 1}}
])



"""6- Mostrar els comentaris d’un vídeo concret ordenats cronològicament. Mostreu dades del vídeo, dades d’usuari que crea el vídeo, data dels comentaris, nota, comentaris i usuaris que han fer els comentaris. """

db.videos.aggregate([
  {$match: {_id: "P2"}},
  {$lookup: {
    from: "usuaris",
    localField: "autor.niu",
    foreignField: "_id",
    as: "info_autor"
  }},
  {$unwind: "$info_autor"},
  {$lookup: {
    from: "comentaris",
    localField: "_id",
    foreignField: "codi_video",
    as: "comentaris"
  }},
  {$unwind: "$comentaris"},
  {$lookup: {
    from: "usuaris",
    localField: "comentaris.usuari.niu",
    foreignField: "_id",
    as: "usuari_comentari"
  }},
  {$unwind: "$usuari_comentari"},
  {$sort: {"comentaris.data": -1}},
  {$project: {
    _id: 0,
    titol: 1,
    descripcio: 1,
    tipus: 1,
    autor_video: {
      niu: "$info_autor._id",
      nom: "$info_autor.nom",
      correu: "$info_autor.correu",
      pais: "$info_autor.pais",
      tipus: "$info_autor.tipus"
    },
    data_comentari: "$comentaris.data",
    nota: "$comentaris.puntuacio",
    comentari: "$comentaris.comentari",
    usuari_comentari: {
      niu: "$usuari_comentari._id",
      nom: "$usuari_comentari.nom",
      correu: "$usuari_comentari.correu",
      pais: "$usuari_comentari.pais",
      tipus: "$usuari_comentari.tipus"
    }
  }}
])



"""7- Alumnes que no han pujat cap vídeo. Mostra les dades de l’alumne. """

db.usuaris.find({tipus: "estudiant", videos_pujats: 0}).project({nom: 1, curs: 1, correu: 1, pais: 1})


db.usuaris.aggregate([
  {$match: {tipus: "estudiant"}},
  {$lookup: {
      from: "videos",
      localField: "_id",       
      foreignField: "autor.niu", 
      as: "llista_videos"
  }},
  {$match: {"llista_videos": {$size: 0}}},
  {$project: {nom: 1, curs: 1, correu: 1, pais: 1}}
])