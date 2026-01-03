import { Request, Response } from "express";
import Launch from "../models/launchModel";
import { uploadToCloudinary } from "../utils/cloudinary";


// Create a launch
export const createLaunch = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check if user already launched today
    const hasLaunchedToday = await Launch.checkUserLaunchedToday(userId);
    if (hasLaunchedToday) {
      return res.status(400).json({ 
        message: "You can only launch one product per day" 
      });
    }

    const {
      name,
      url,
      tagline,
      categories,
      builtWith,
      collaborators,
      isOpenSource,
      description,
    } = req.body;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    let imageUrl = "";
    let galleryUrls: string[] = [];

    // Upload main image
    if (files && files.image && files.image.length > 0) {
      const uploadedImage = await uploadToCloudinary(files.image[0], "launches");
      imageUrl = uploadedImage.url;
    }

    // Upload gallery images
    if (files && files.gallery && files.gallery.length > 0) {
      const uploadPromises = files.gallery.map((file) => 
        uploadToCloudinary(file, "launches")
      );
      const uploadedGallery = await Promise.all(uploadPromises);
      galleryUrls = uploadedGallery.map((img) => img.url);
    }

    // Validation
    if (!name || !tagline) {
      return res.status(400).json({ 
        message: "Name and tagline are required" 
      });
    }

    if (name.length > 45) {
      return res.status(400).json({ 
        message: "Name must be 45 characters or less" 
      });
    }

    if (tagline.length > 60) {
      return res.status(400).json({ 
        message: "Tagline must be 60 characters or less" 
      });
    }

    if (categories && categories.length > 3) {
      return res.status(400).json({ 
        message: "Maximum 3 categories allowed" 
      });
    }

    if (builtWith && builtWith.length > 10) {
      return res.status(400).json({ 
        message: "Maximum 10 tech tags allowed" 
      });
    }

    if (description && description.length > 5000) {
      return res.status(400).json({ 
        message: "Description must be 5000 characters or less" 
      });
    }

    // Create launch with today's date
    const launch = await Launch.create({
      name,
      url,
      tagline,
      image: imageUrl,
      gallery: galleryUrls,
      categories: categories || [],
      builtWith: builtWith || [],
      collaborators: collaborators || [],
      isOpenSource: isOpenSource || false,
      description,
      launchDate: new Date(),
      author: userId,
      upvotes: [],
      views: 0,
    });

    await launch.populate("author", "firstname lastname username avatar");

    return res.status(201).json({
      success: true,
      message: "Launch created successfully",
      launch,
    });
  } catch (error: any) {
    console.error("Error creating launch:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create launch",
    });
  }
};

// Get launches by date
export const getLaunches = async (req: Request, res: Response) => {
  try {
    let date: Date;
    
    if (req.query.date) {
      date = new Date(req.query.date as string);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
    } else {
      // Default to today
      date = new Date();
    }

    const launches = await Launch.getLaunchesByDate(date);

    // Sort by upvote count (highest first)
    const sortedLaunches = launches.sort((a, b) => {
      return (b.upvotes?.length || 0) - (a.upvotes?.length || 0);
    });

    return res.status(200).json({
      success: true,
      launches: sortedLaunches,
      date: date.toISOString(),
    });
  } catch (error: any) {
    console.error("Error getting launches:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get launches",
    });
  }
};

// Toggle upvote on a launch
export const toggleUpvote = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { launchId } = req.params;

    const launch = await Launch.findById(launchId);
    if (!launch) {
      return res.status(404).json({ message: "Launch not found" });
    }

    const hasUpvoted = launch.upvotes.includes(userId as any);

    if (hasUpvoted) {
      // Remove upvote
      launch.upvotes = launch.upvotes.filter(
        (id) => id.toString() !== userId
      );
    } else {
      // Add upvote
      launch.upvotes.push(userId as any);
    }

    await launch.save();
    await launch.populate("author", "firstname lastname username avatar");

    return res.status(200).json({
      success: true,
      message: hasUpvoted ? "Upvote removed" : "Upvote added",
      launch,
      hasUpvoted: !hasUpvoted,
    });
  } catch (error: any) {
    console.error("Error toggling upvote:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to toggle upvote",
    });
  }
};

// Check if user can launch today
export const checkCanLaunch = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const hasLaunchedToday = await Launch.checkUserLaunchedToday(userId);

    return res.status(200).json({
      success: true,
      canLaunch: !hasLaunchedToday,
    });
  } catch (error: any) {
    console.error("Error checking launch status:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to check launch status",
    });
  }
};
