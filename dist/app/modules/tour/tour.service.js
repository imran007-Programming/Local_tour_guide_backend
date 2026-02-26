"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tourService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../error/ApiError"));
const prisma_1 = require("../../lib/prisma");
const fileUploader_1 = require("../../helper/fileUploader");
const paginationHelper_1 = require("../../helper/paginationHelper");
const tour_constant_1 = require("./tour.constant");
const createTour = async (req) => {
    const userId = req.user.userId;
    const payload = req.body;
    const imageUrlList = [];
    if (typeof payload.languages === 'string') {
        payload.languages = JSON.parse(payload.languages);
    }
    if (req.files && Array.isArray(req.files)) {
        for (const file of req?.files) {
            const uploadResult = await fileUploader_1.fileUploader.uploadToCloudinary(file);
            imageUrlList.push(uploadResult.secure_url);
        }
    }
    const guide = await prisma_1.prisma.guide.findUnique({
        where: { userId }
    });
    if (!guide) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Guide profile not found");
    }
    if (!guide.id) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Only guides can create tours");
    }
    const slug = payload.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    return prisma_1.prisma.tour.create({
        data: {
            title: payload.title,
            slug,
            description: payload.description,
            price: payload.price,
            duration: payload.duration,
            meetingPoint: payload.meetingPoint,
            maxGroupSize: payload.maxGroupSize,
            images: imageUrlList,
            city: payload.city,
            guideId: guide.id,
            itinerary: payload.itinerary,
            category: payload.category,
            languages: payload.languages,
        },
    });
};
const getAllTour = async (options, filters) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const { searchTerm, maxPrice, minPrice, guest, duration, ...filterData } = filters;
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            OR: tour_constant_1.tourSearchableFields.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive"
                }
            }))
        });
    }
    if (guest) {
        andConditions.push({
            maxGroupSize: {
                gte: Number(guest)
            }
        });
    }
    if (duration) {
        andConditions.push({
            duration: {
                gte: Number(duration)
            }
        });
    }
    if (Object.keys(filterData).length > 0) {
        const filterConditions = Object.keys(filterData).map((key) => ({
            [key]: {
                equals: filterData[key]
            }
        }));
        andConditions.push(...filterConditions);
    }
    // Filter by price Range
    if (maxPrice || minPrice) {
        const priceConditions = {};
        if (minPrice)
            priceConditions.gte = Number(minPrice);
        if (maxPrice)
            priceConditions.lte = Number(maxPrice);
        andConditions.push({ price: priceConditions });
    }
    const whereConditions = andConditions?.length > 0 ? { AND: andConditions } : {};
    const result = await prisma_1.prisma.tour.findMany({
        where: {
            AND: whereConditions,
            isActive: true
        },
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder
        },
    });
    const total = await prisma_1.prisma.tour.count({
        where: whereConditions
    });
    return {
        meta: {
            total,
            page,
            limit,
        },
        data: result
    };
};
const getSingleTour = async (slug) => {
    return await prisma_1.prisma.tour.findUnique({
        where: { slug },
        include: {
            guide: {
                select: {
                    id: true,
                    expertise: true,
                    dailyRate: true,
                    user: true
                }
            }
        }
    });
};
const updateTour = async (tourId, payload) => {
    return await prisma_1.prisma.tour.update({
        where: {
            id: tourId
        },
        data: payload
    });
};
const deleteTour = async (tourId) => {
    const bookings = await prisma_1.prisma.booking.count({
        where: { tourId },
    });
    if (bookings > 0) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Cannot delete tour with existing bookings");
    }
    return await prisma_1.prisma.tour.delete({
        where: {
            id: tourId
        }
    });
};
const addTourImages = async (tourId, req) => {
    const uploadedImages = [];
    if (req.files && Array.isArray(req.files)) {
        for (const file of req.files) {
            const result = await fileUploader_1.fileUploader.uploadToCloudinary(file);
            uploadedImages.push(result.secure_url);
        }
    }
    const existingTour = await prisma_1.prisma.tour.findUnique({
        where: { id: tourId },
    });
    if (!existingTour) {
        throw new Error("Tour not found");
    }
    return prisma_1.prisma.tour.update({
        where: { id: tourId },
        data: {
            images: [
                ...existingTour.images,
                ...uploadedImages,
            ],
        },
    });
};
const deleteTourImage = async (tourId, imageUrl) => {
    const existingTour = await prisma_1.prisma.tour.findUnique({
        where: { id: tourId },
    });
    if (!existingTour) {
        throw new Error("Tour not found");
    }
    // Delete from Cloudinary
    await fileUploader_1.fileUploader.deleteFromCloudinary(imageUrl);
    const updatedImages = existingTour.images.filter((img) => img !== imageUrl);
    return prisma_1.prisma.tour.update({
        where: { id: tourId },
        data: {
            images: updatedImages,
        },
    });
};
const getCategories = async () => {
    const categories = await prisma_1.prisma.tour.findMany({
        where: { isActive: true },
        select: { category: true },
        distinct: ['category']
    });
    return categories.map(c => c.category);
};
exports.tourService = {
    createTour,
    getAllTour,
    getSingleTour,
    updateTour,
    deleteTour,
    addTourImages,
    deleteTourImage,
    getCategories
};
