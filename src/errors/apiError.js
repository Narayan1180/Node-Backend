

class ApiError extends  Error{

    constructor(meassge,statusCode){
        super(meassge);
        this.statusCode=statusCode;
        this.isOperational=true;

        Error.captureStackTrace(this,this.constructor)
    }


}

export default ApiError;