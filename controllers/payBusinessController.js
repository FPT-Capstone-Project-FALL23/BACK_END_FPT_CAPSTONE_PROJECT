const PayBusiness = require("../model/payBusinessModel");

async function createPayBusinessOfEvent(req, res) {
    try {
        const { organizers_id, totalEventAmount } = req.body;
        const { event_id, paymentDate, isPay, isRequest } = req.body.payBusiness;

        // Find the PayBusiness document by organizers_id
        const payBusiness = await PayBusiness.findOne({ organizers_id });

        if (!payBusiness) {
            // If no PayBusiness document exists, create a new one
            const newPayBusiness = new PayBusiness({
                organizers_id,
                pay: [{
                    event_id,
                    totalEventAmount,
                    paymentDate,
                    isPay,
                    isRequest
                }],
                organizerTotalAmount: totalEventAmount
            });
            await newPayBusiness.save();
        } else {
            // If PayBusiness document exists, update the pay and organizerTotaflAmount fields
            payBusiness.pay.push({
                event_id,
                totalEventAmount,
                paymentDate,
                isPay,
                isRequest
            });
            payBusiness.organizerTotalAmount += totalEventAmount;
            await payBusiness.save();
        }

        // Xử lý khi thành công
        res.status(200).json({
            status: true,
            message: 'success',
            data: payBusinessOrganizes
        })
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
}

module.exports = { createPayBusinessOfEvent }