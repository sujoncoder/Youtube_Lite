import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asyncHandler(async (req, res) => {
    // algorithom
    // get user details from frontend.
    // validation - not empty.
    // check if user already exist - username, email.
    // check for images, check for avatar'
    // upload them to cloudinary - avatar.
    // create user object - create entry in db.
    // remove password and refresh token field from response.
    // check for user creation.
    // return res.



    // get user details from frontend.
    const { fullName, email, username, password } = req.body;

    // validation - not empty.
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(500, "All fields are required")
    };

    // check if user already exist - username, email.
    const existUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existUser) {
        throw new ApiError(409, "User with email or username already exists")
    };

    // check for images, check for avatar
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    console.log("avatar", avatarLocalPath);


    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    console.log("cover", coverImageLocalPath);


    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    };

    // upload them to cloudinary - avatar.
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const cover = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    };

    if (!cover) {
        throw new ApiError(400, "Cover file is required")
    };

    // create user object - create entry in db.
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: cover?.url || "",
        email,
        password,
        username: username.toLowerCase()
    });

    // remove password and refresh token field from response.
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    // check for user creation.
    if (!createdUser) {
        throw new ApiError(500, "something went to wrong while registering the user")
    }

    // return res.
    return res.status(201).json(
        new ApiResponse(200, "createdUser", "User registerd successfully")
    )
});

export { registerUser };