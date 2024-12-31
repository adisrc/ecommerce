import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { Link } from 'react-router-dom';
import { Card, CardContent, CardMedia, Typography } from '@mui/material';

const ProductItem = ({id,image,name,price}) => {
  const { currency } = useContext(ShopContext);

  return (
    <Link to={`/product/${id}`} className="no-underline text-inherit">

<div className='transition-transform duration-200 ease-in-out hover:scale-105 transform'>
<Card 
      className="rounded-lg shadow-md overflow-hidden">
        <CardMedia
          component="img"
          image={image[0]}
          alt={name}
          className="h-48 object-cover"
        />
        <CardContent className="p-4">
          <Typography variant="subtitle1" className="font-medium mb-2 truncate">
            {name}
          </Typography>
          <Typography variant="body2" className="text-gray-500">
            {currency} {price}
          </Typography>
        </CardContent>
      </Card>
</div>
    </Link>
  );
}

export default ProductItem