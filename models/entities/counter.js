const mongoose = require('mongoose');
const schema = mongoose.Schema;

const counterSchema = new schema({
  _id: { type: String, required: true }, // Cambia de ObjectId a String
  sequence_value: { type: Number, default: 0 },
  id_franquicia: { type: mongoose.Schema.Types.ObjectId, ref: 'Franquicias', required: true }
});

counterSchema.index({ _id: 1, id_franquicia: 1 }, { unique: true });

const Counter = mongoose.model('Contadores', counterSchema);

module.exports = Counter;
