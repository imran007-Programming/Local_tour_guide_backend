import httpStatus from 'http-status';
import { Request, Response, response } from "express"
import { catchAsync } from "../../shared/catchAsync"
import sendResponse from "../../shared/sendResponse"
import { bookingService } from "./booking.service";
import { bookingFilterableFields } from "./booking.contant";
import pick from "../../helper/Pick";

const createBooking = catchAsync(async (req: Request & { user?: any }, res: Response) => {
    const payload = req.body;
    const user = req.user
    const result = await bookingService.createBooking(user, payload)

    sendResponse(res, ({
        statusCode: 201,
        success: true,
        message: "Booking create successfully",
        data: result,

    }))
})

const getMyBookings = catchAsync(async (req: Request & { user?: any }, res: Response) => {

    const user = req.user
    const result = await bookingService.getMyBooking(user)

    sendResponse(res, ({
        statusCode: 201,
        success: true,
        message: "Booking create successfully",
        data: result,

    }))
})


const completedBooking = catchAsync(async (req: Request, res: Response) => {
    const user = req.user
    const bookingId = req.params.bookingId
    const result = await bookingService.completedBooking(user, bookingId)


    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "status updated successfully",
        data: result
    })
})


const cancelBooking = catchAsync(async (req: Request & { user?: any }, res: Response) => {
    const bookingId = String(req.params.bookingId)
    const user = req.user
    const payload = req.body
    const result = await bookingService.cancelBooking(user, payload, bookingId)

    sendResponse(res, ({
        statusCode: 201,
        success: true,
        message: "Booking canceled successfully",
        data: result,

    }))
})
const getAssignedBooking = catchAsync(async (req: Request, res: Response) => {
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"])
    const filters = pick(req.query, bookingFilterableFields)
    const user = req.user
    const result = await bookingService.getAssignedBooking(options, filters, req, user)

    sendResponse(res, ({
        statusCode: 201,
        success: true,
        message: "Booking retrived successfully successfully",
        data: result,

    }))
})

const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
    const user = req.user
    const bookingId = req.params.bookingId
    const payload = req.body
    const result = await bookingService.updateBookingStatus(user, bookingId, payload)
    sendResponse(res, ({
        statusCode: httpStatus.OK,
        success: true,
        message: "Booking status updated successfully",
        data: result,

    }))
})



export const bookingController = {
    createBooking,
    getMyBookings,
    cancelBooking,
    getAssignedBooking,
    updateBookingStatus,
    completedBooking,
}