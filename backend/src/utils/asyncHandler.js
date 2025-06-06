// In this file, we will create a function to hamdle all the async functions.

const asyncHandler = (asyncFunc) => async (req, res, next) => {
    // We are using a common functon asyncHanlder as the utility to handle all the async functions and to avoid the repetetive usage of try catch block
    try{
        await asyncFunc(req, res, next);
    }
    catch(err){
        res.status(500).json({
            success: false,
            message: err.message || "Internal Server Error"
        })
    }

}

export {asyncHandler};
