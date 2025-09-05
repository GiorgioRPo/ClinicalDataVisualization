from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd

app = Flask(__name__)
CORS(app)

@app.route("/get-spider")
def get_spider():
    df = pd.read_csv("spiderplot (002).csv")
    
     # --- get query params ---
    arms = request.args.get("arms")        # e.g. "A,B"
    doses = request.args.get("doses")      # e.g. "1800,3000"
    tumor_types = request.args.get("tumor_types")  # e.g. "sqNSCLC,HNSCC"

    # --- filter if provided ---
    if arms:
        df = df[df["arm"].isin(arms.split(","))]
    if doses:
        df = df[df["dose"].isin(map(int, doses.split(",")))]
    if tumor_types:
        df = df[df["tumor_type"].isin(tumor_types.split(","))]

    return jsonify(df.to_dict(orient="records"))


if __name__ == "__main__":
    app.run(debug=True)
