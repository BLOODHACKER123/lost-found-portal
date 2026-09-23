const mongoose = require("mongoose");

const claimSchema =new mongoose.Schema(
    {
        item:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"Item",
            required:true,
        },

        claimant:{
            type: mongoose.Schema.Types.ObjectId,
            ref :"User",
            required :true,
        },
        message:{
            type :String,
            required :[ true,"claim message is required"],
            trim :true,
            minlength: [10, "Claim message must contain at least 10 characters"],
            maxlength: [500,"Claim message cannot exceed 500 characters"],
        },

    status:{
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
        },
    },
    {
    timestamps: true,
  }
);

// One user can submit only one claim for the same item
claimSchema.index(
  {
    item: 1,
    claimant: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("Claim", claimSchema);