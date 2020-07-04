import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./data/poi.mbtiles", sqlite3.OPEN_READONLY);

type Callback = (param: {
  statusCode: number;
  headers: { [key: string]: string };
  body: string | Buffer;
}) => {};

const isBuffer = (data: any): data is Buffer => Buffer.isBuffer(data);

const handler = (event: any, _1: any, callback: Callback) => {
  db.on("error", (error) => {
    console.error(error);
    callback({
      statusCode: 500,
      headers: {},
      body: JSON.stringify({ message: "Unknown Error." }),
    });
  });

  // validate path params
  const { z: _z, x: _x, y: _y } = event.pathParameters;
  const [z, x, y] = [_z, _x, _y].map((val) => parseInt(val, 10));
  const invalidTileXYZ = [x, y, z].every(
    (val) => Number.isNaN(val) && val > -1
  );
  if (!invalidTileXYZ) {
    return callback({
      statusCode: 400,
      headers: {},
      body: JSON.stringify({ message: "Invalid Path Paramters." }),
    });
  }

  db.serialize(() => {
    db.each(
      `SELECT * FROM tiles WHERE zoom_level=${z} AND tile_column=${x} AND tile_row=${y} LIMIT 1`,
      (error, row) => {
        if (error) {
          console.error(error);
          return callback({
            statusCode: 500,
            headers: {},
            body: JSON.stringify({ message: "Unknown Error" }),
          });
        }

        const data = row.tile_data;
        if (!isBuffer(data)) {
          return callback({
            statusCode: 500,
            headers: {},
            body: JSON.stringify({ message: "Unknown Error" }),
          });
        } else {
          return callback({
            statusCode: 200,
            headers: {},
            body: data,
          });
        }
      }
    );
  });
  db.close();
};

const lambdaProxyEvent = {
  pathParameters: {
    z: 7,
    x: 114,
    y: 86,
  },
};
handler(lambdaProxyEvent, {}, () => {});
