const PayBusiness = require("../model/payBusinessModel");

async function createPayBusinessOfEvent(req, res) {
    try {
        const { organizers_id, totalEventAmount } = req.body;
        const { event_id, event_name, isPay, isRequest } = req.body.payBusiness;

        // Find the PayBusiness document by organizers_id
        const payBusiness = await PayBusiness.findOne({ organizers_id: organizers_id }).exec();

        payBusiness.pay.push({
            event_id: event_id,
            event_name: event_name,
            totalEventAmount: totalEventAmount,
            isPay: isPay,
            isRequest: isRequest
        });
        payBusiness.organizerTotalAmount += totalEventAmount;
        await payBusiness.save();

        // Xử lý khi thành công
        res.status(200).json({
            status: true,
            message: 'success',
            data: payBusiness
        })
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
}

async function getPayBusinessWithRequest(req, res) {
    try {
        const payBusinesses = await PayBusiness.find({ 'pay.isRequest': true }).populate('organizers_id');

        const formatPayBussiness = [];
        for (const payBusines of payBusinesses) {
            for (const payDetail of payBusines.pay) {
                const result = {
                    organizer_name: payBusines.organizers_id.organizer_name,
                    event_name: payDetail.event_name,
                    totalEventAmount: payDetail.totalEventAmount,
                    paymentDate: payDetail.paymentDate,
                    isRequest: payDetail.isRequest,
                    isPay: payDetail.isPay,
                }
                formatPayBussiness.push(result)
            }
        }

        // Xử lý khi thành công
        res.status(200).json({
            status: true,
            message: 'success',
            data: formatPayBussiness
        })
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
}

async function getPayBusinessWithOrganizers(req, res) {
    try {
        const { organizers_id } = req.body;

        const payBusinesses = await PayBusiness.findOne({ organizers_id: organizers_id }).exec();

        // Xử lý khi thành công
        res.status(200).json({
            status: true,
            message: 'success',
            data: payBusinesses
        })
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
}

async function calculateTotalAmountAndTransactionNumber(req, res) {
    try {
        const payBusiness = await PayBusiness.findOne().exec();
        if (!payBusiness) {
            throw new Error('PayBusiness not found');
        }

        const totalAmount = payBusiness.pay.reduce((acc, pay) => acc + pay.totalEventAmount, 0);
        const transactionNumber = payBusiness.pay.length;

        // Xử lý khi thành công
        res.status(200).json({
            status: true,
            message: 'success',
            data: { totalAmount, transactionNumber, payBusiness }
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
}

module.exports = {
    createPayBusinessOfEvent,
    getPayBusinessWithRequest,
    getPayBusinessWithOrganizers,
    calculateTotalAmountAndTransactionNumber
}