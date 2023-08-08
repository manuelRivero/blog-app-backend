

export function errorHandler(err, req, res, next) {
    if (typeof err === 'string') {
        // custom application error
        const is404 = err.toLowerCase().endsWith('not found');
        const statusCode = is404 ? 404 : 400;
        
        return res.status(statusCode).json({ message: err });
    } else if (err.name === 'ValidationError') {
        for (let key of Object.keys(err.errors)) err.errors[key] =  err.errors[key].message;
     
        return res.status(400).json(err.errors);
    } else if (err.name === 'ValidationErrorCustom') {
       
        return res.status(400).json(err.errors);
    } else if (err.name === 'UnauthorizedError') {
       
        return res.status(401).json({ message: 'Unauthorized' });
    } else {
        console.log(err);
        return res.status(500).json({ message: err.message });
    }
}
