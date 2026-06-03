import mongoose from "mongoose";

const rentalItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: [
        "electronics",
        "furniture",
        "books",
        "hostel essentials",
        "sports",
        "Mobile Accessories",
        "Decor Items",
        "other",
      ],
      required: true,
    },

    pricePerDay: {
      type: Number,
      default: 0,
    },

    pricePerMonth: {
      type: Number,
      required: true,
    },


    sellingPrice: {
      type: Number,
      required: true,
    },



    images: [
      {
        type: String,
      },
    ],

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    condition: {
      type: String,
      enum: ["new", "good", "average", "old"],
      default: "good",
    },

    availability: {
      type: Boolean,
      default: true,
    },

    pickupLocation: {
      type: String,
      required: true,
    },

    rating: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const RentalItem = mongoose.model("RentalItem",rentalItemSchema);