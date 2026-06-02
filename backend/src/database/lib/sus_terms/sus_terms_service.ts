import SusTerm, { SusTermDoc } from './sus_terms_model';

async function list(): Promise<SusTermDoc[]> {
  return SusTerm.find({});
}

async function create(body: any): Promise<SusTermDoc> {
  const doc = new SusTerm({ ...body });
  await doc.save();
  return doc;
}

async function remove(id: string): Promise<void> {
  await SusTerm.findByIdAndDelete(id);
}

async function update(id: string, body: any): Promise<void> {
  await SusTerm.findByIdAndUpdate(id, body);
}

export default {
  list,
  create,
  remove,
  update,
};
