from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
import pandas as pd
import random
import os

app = Flask(__name__)
CORS(app)

df = pd.read_csv("lichess_db_puzzle.csv")

#Cleaning all the NaN values
df = df[df['Rating'].notna()]  #Don't use notnull() as it is outdated

@app.route("/")
def home():
    return render_template('index.html')

@app.route("/puzzle", methods=["GET"])
def get_puzzle():
    min_rating = int(request.args.get("min_rating", 0))
    max_rating = int(request.args.get("max_rating", 3000))

    filtered_puzzles = df[(df['Rating'] <= max_rating) & (df['Rating'] >= min_rating)]

    if (filtered_puzzles.empty):
        return jsonify({"error": "No puzzles found in this rating range"}), 404
    
    """
    df.sample(1) picks one random row from the dataframe
    """

    row = filtered_puzzles.sample(1).iloc[0]

    puzzle = {
        "id": row["PuzzleId"],
        "fen": row["FEN"],
        "moves": row["Moves"].split(), #For converting into lists
        "rating": int(row["Rating"]), #type(row['Rating']) = numpy.int64 so that's why we convert to python int() for jsonification
        "themes": row["Themes"].split(),
        "url": row["GameUrl"],
    }

    return jsonify(puzzle) #converts dictionary to json


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)