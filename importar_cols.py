import json
import argparse
import sys
import os
from pymongo import MongoClient, UpdateOne

HOST = "mongoDB.uab.cat"
PORT = 27017
USER = "1709458"
PASSWORD = "a50d8e"
AUTH_DB = "BDNR_1709458"
DB_NAME = "BDNR_1709458"


def connectar_mongodb():
    try:
        # Nota: He afegit authSource per assegurar la connexió a la UAB
        uri = f"mongodb://{USER}:{PASSWORD}@{HOST}:{PORT}/{AUTH_DB}?authSource={AUTH_DB}"
        client = MongoClient(uri)
        return client[DB_NAME]
    except Exception as e:
        print(f"Error connectant a MongoDB: {e}")
        sys.exit(1)


def map_nom_colleccio(nom_fitxer):
    mapping = {
        "Videos": "videos",
        "Usuari": "usuaris",
        "Assignatures": "assignatures",
        "Visualitzacions": "visualitzacions",
        "Comentaris": "comentaris"
    }
    # Fem que no importi si el fitxer està en majúscules o minúscules
    return mapping.get(nom_fitxer.capitalize(), nom_fitxer.lower())


def obtenir_filtre(doc, nom_coll):
    if "_id" not in doc or doc["_id"] is None:
        print(f"Document ignorat a '{nom_coll}' (falta _id)")
        return None
    return {"_id": doc["_id"]}


def carregar_dades_carpeta(carpeta):
    if not os.path.isdir(carpeta):
        print(f"Error: {carpeta} no és una carpeta vàlida")
        sys.exit(1)

    dades = {}
    for fitxer in os.listdir(carpeta):
        if fitxer.endswith(".json"):
            ruta = os.path.join(carpeta, fitxer)
            nom_fitxer = fitxer.replace(".json", "")
            nom_coll = map_nom_colleccio(nom_fitxer)

            try:
                with open(ruta, 'r', encoding='utf-8') as f:
                    dades[nom_coll] = json.load(f)
            except Exception as e:
                print(f"Error llegint {fitxer}: {e}")
    return dades


def importar_a_mongodb(dades):
    db = connectar_mongodb()

    for nom_coll, docs in dades.items():
        if not docs:
            continue

        operacions = []
        for doc in docs:
            filtre = obtenir_filtre(doc, nom_coll)
            
            # Verifiquem que el filtre no tingui valors None
            if not filtre or any(v is None for v in filtre.values()):
                print(f"Document ignorat a '{nom_coll}' (falta clau primària)")
                continue

            operacions.append(UpdateOne(filtre, {"$set": doc}, upsert=True))

        if operacions:
            try:
                resultat = db[nom_coll].bulk_write(operacions)
                print(f"Col·lecció '{nom_coll}': {resultat.upserted_count} nous, {resultat.modified_count} actualitzats.")
            except Exception as e:
                print(f"Error a '{nom_coll}': {e}")


def main():
    parser = argparse.ArgumentParser(description="Importador JSON a MongoDB (Corregit)")
    parser.add_argument("-f", "--folder", required=True, help="Carpeta amb fitxers JSON")
    args = parser.parse_args()

    dades = carregar_dades_carpeta(args.folder)
    importar_a_mongodb(dades)
    print("\nProcés finalitzat correctament.")


if __name__ == "__main__":
    main()