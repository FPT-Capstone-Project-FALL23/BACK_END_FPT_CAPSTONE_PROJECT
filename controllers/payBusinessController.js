const Organizer = require("../model/organizersModels");
const PayBusiness = require("../model/payBusinessModel");
const { calculatePaginationParams, formatDate, formatDateTime, formatMoney } = require("./adminControler");

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
        const { page } = req.body;
        const payBusinesses = await PayBusiness.find().populate('organizers_id').exec();

        const formatPayBussiness = [];
        let amountPaidOrganization = 0
        let amountRequestOrganizations = 0
        for (const payBusines of payBusinesses) {
            const totalAmount = totalAmountPaid(payBusines)
            amountPaidOrganization += totalAmount;
            amountRequestOrganizations += payBusines.organizerTotalAmount
            for (const payDetail of payBusines.pay) {
                const result = {
                    organizer_name: payBusines.organizers_id.organizer_name,
                    event_name: payDetail.event_name,
                    totalEventAmount: formatMoney(payDetail.totalEventAmount),
                    paymentDate: formatDateTime(payDetail.paymentDate),
                    isRequest: payDetail.isRequest,
                    isPay: payDetail.isPay,
                    _id: payDetail._id
                }
                formatPayBussiness.push(result)
            }
        }

        const limit = 5; // Number of clients per page
        const totalItems = formatPayBussiness.length;
        const { totalPages, skip, currentPage } = calculatePaginationParams(page, limit, totalItems)

        // Sorting by isPay (false first) and then by paymentDate (ascending)
        formatPayBussiness.sort((a, b) => {
            if (a.isPay === b.isPay) {
                const aPaymentDate = new Date(a.paymentDate);
                const bPaymentDate = new Date(b.paymentDate);
                return aPaymentDate - bPaymentDate;
            }
            return a.isPay ? 1 : -1;
        });

        const paginatedPayBusiness = formatPayBussiness.slice(skip, skip + limit);


        // Xử lý khi thành công
        res.status(200).json({
            status: true,
            message: 'success',
            data: {
                totalItems,
                totalPages,
                currentPage,
                paginatedPayBusiness,
                amountPaidOrganization,
                amountRequestOrganizations
            }
        })
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
}

async function getPayBusinessWithOrganizers(req, res) {
    try {
        const { organizers_id, page } = req.body;

        const payBusinesses = await PayBusiness.findOne({ organizers_id: organizers_id }).exec();
        const informationOrganizers = await Organizer.findById(organizers_id).exec();
        if (!payBusinesses) {
            return res.status(404).json('PayBusiness not found');
        }
        if (!informationOrganizers) {
            return res.status(400).json({
                status: false,
                message: 'Organizer không tồn tại',
            });
        }
        const limit = 5; // Number of clients per page
        const totalItems = payBusinesses.pay.length;
        const { totalPages, skip, currentPage } = calculatePaginationParams(page, limit, totalItems)

        const paginatedPayList = payBusinesses?.pay?.slice(skip, skip + limit);

        // const pay = payBusinesses.pay.filter((p) => p.isPay === true);
        // const totalAmount = pay.reduce((acc, payBusiness) => acc + payBusiness.organizerTotalAmount, 0);
        const totalAmount = totalAmountPaid(payBusinesses);
        console.log("totalAmount1", totalAmount)

        const wallet = {
            accountOwnerBank: informationOrganizers.bankCardName,
            accountNumberBank: informationOrganizers.bankCardNumber,
            bankCard: informationOrganizers.bankCard,
            totalRequestAmount: payBusinesses.organizerTotalAmount,
            ActualTotalAmount: totalAmount
        }


        // Xử lý khi thành công
        res.status(200).json({
            status: true,
            message: 'success',
            data: {
                totalItems,
                totalPages,
                currentPage,
                paginatedPayList,
                wallet
            }
        })
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
}

function totalAmountPaid(payBusinesses) {
    const pay = payBusinesses?.pay?.filter((p) => p.isPay === true);
    const totalAmount = pay.reduce((acc, payBusiness) => acc + payBusiness.totalEventAmount, 0);

    return totalAmount;
}

async function setIsPayForOrganizers(req, res) {
    try {
        const { paymentId } = req.body;
        const payment = await PayBusiness.findOneAndUpdate(
            { 'pay._id': paymentId },
            { $set: { 'pay.$.isPay': true } },
            { new: true }
        );

        if (!payment) {
            return res.status(404).json('Payment not found');
        }

        res.status(200).json({
            status: true,
            message: 'Payment status updated successfully',
            data: payment,
        });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
}


module.exports = {
    createPayBusinessOfEvent,
    getPayBusinessWithRequest,
    getPayBusinessWithOrganizers,
    setIsPayForOrganizers
}