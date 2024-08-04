const Counter = require('../../models/entities/counter'); // Ajusta la ruta según corresponda

async function getNextSequenceValue(sequenceName, id_franquicia) {
  const sequenceDocument = await Counter.findOneAndUpdate(
    { _id: `${sequenceName}_${id_franquicia.toString()}`, id_franquicia },
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  );
  return sequenceDocument.sequence_value;
}

module.exports = getNextSequenceValue;
