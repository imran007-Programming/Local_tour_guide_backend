"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingSearchableFields = exports.bookingFilterableFields = void 0;
exports.bookingFilterableFields = [
    "searchTerm",
    "status",
    "bookingDateTime",
    "tourId",
    "touristId",
    "createdAt"
];
exports.bookingSearchableFields = [
    "tour.title",
    "tourist.user.name",
    "tourist.user.email"
];
