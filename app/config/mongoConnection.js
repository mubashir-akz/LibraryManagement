const mongoClient = require('mongodb').MongoClient;

const state = {
  db: null,
};
module.exports.connect = () => {
  const url = 'mongodb://localhost:27017';
  const dbname = 'Library';

  mongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
    if (err) console.log(err);
    state.db = client.db(dbname);
    console.log('Database Connected Succesfully');
  });
};

module.exports.get = () => state.db;
