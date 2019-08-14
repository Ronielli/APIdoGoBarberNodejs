import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { Op } from 'sequelize';
import Appointments from '../models/Appointments';
import User from '../models/User';

class ScheduleController {
  async index(req, res) {
    const checkUserProvider = await User.findOne({
      where: { id: req.userId, provider: true },
    });
    if (!checkUserProvider) {
      return res.status(401).json({ error: 'User is not a provider' });
    }
    const { data } = req.query;

    const parseData = parseISO(data);

    const appointments = await Appointments.findAll({
      where: {
        provider_id: req.userId,
        canceled_at: null,
        data: {
          [Op.between]: [startOfDay(parseData), endOfDay(parseData)],
        },
      },
      include: [{ model: User, as: 'user', attributes: ['name'] }],
      order: ['data'],
    });

    return res.json(appointments);
  }
}
export default new ScheduleController();
