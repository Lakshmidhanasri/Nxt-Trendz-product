// Write your code here
import {Component} from 'react'
import {Link} from 'react-router-dom'
import Cookies from 'js-cookie'
import Loader from 'react-loader-spinner'
import {BsPlusSquare, BsDashSquare} from 'react-icons/bs'

import Header from '../Header'
import SimilarProductItem from '../SimilarProductItem'

const apiStatusConstants = {
  initial: 'INITIAL',
  succes: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

class ProductItemDetails extends Component {
  state = {
    productDate: {},
    similarProductData: [],
    apiStatus: apiStatusConstants.initial,
    quantity: 1,
  }

  componentDidMount() {
    this.getProductData()
  }

  getFormateedData = data => ({
    availability: data.availability,
    brand: data.brand,
    description: data.description,
    id: data.id,
    imageUrl: data.image_url,
    price: data.price,
    rating: data.rating,
    title: data.title,
    totalReviews: data.total_reviews,
  })

  getProductData = async () => {
    const {match} = this.props
    const {params} = match
    const {id} = params
    this.setState({
      apiStatus: apiStatusConstants.inProgress,
    })
    const jwtToken = Cookies.get('jwt_token')
    const apiUrl = `https://apis.ccbp.in/products/${id}`
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      mathod: 'GET',
    }
    const response = await fetch(apiUrl, options)
    if (response.ok) {
      const fetchedData = await response.json()
      const updateData = this.getFormateedData(fetchedData)
      const updateSimilarProductData = fetchedData.similar_products.map(
        eachItem => this.getFormateedData(eachItem),
      )

      this.setState({
        productDate: updateData,
        similarProductData: updateSimilarProductData,
        apiStatus: apiStatusConstants.succes,
      })
    }
    if (response.status === 404) {
      this.setState({
        apiStatus: apiStatusConstants.failure,
      })
    }
  }

  renderLoadindView = () => (
    <div className="product-details-loader-container" data-testid="loader">
      <Loader type="ThreeDots" color="#0b69ff" height="50" width="50" />
    </div>
  )

  renderFailureView = () => (
    <div className="product-details-failure-view-container">
      <img
        src="https://assets.ccbp.in/frontend/react-js/nxt-trendz-error-view-img.png"
        alt="failure view"
        className="failure-view-image"
      />
      <h1 className="product-not-found-heading">Product Not Found</h1>
      <Link to="/products">
        <button className="button" type="button">
          Continue Shopping
        </button>
      </Link>
    </div>
  )

  onDecrementQuantity = () => {
    const {quantity} = this.state
    if (quantity > 1) {
      this.setState(prevState => ({quantity: prevState.quantity - 1}))
    }
  }

  onIncrementQuantity = () => {
    this.setState(prevState => ({quantity: prevState.quantity + 1}))
  }

  renderProductDetailView = () => {
    const {productDate, quantity, similarProductData} = this.state
    const {
      availability,
      brand,
      description,
      imageUrl,
      price,
      rating,
      title,
      totalReviews,
    } = productDate

    return (
      <div className="product-details-succes-view ">
        <div className="product-detail-container">
          <img src={imageUrl} alt="product" className="product-image" />
          <div className="product">
            <h1 className="product-name">{title}</h1>
            <p className="price-details">RS {price}</p>
            <div className="rating-and-review-count">
              <div className="review-container">
                <p className="rating">{rating}</p>
                <img
                  src="https://assets.ccbp.in/frontend/react-js/star-img.png"
                  className="star"
                  alt="star"
                />
              </div>
              <p className="rating-count">{totalReviews}</p>
            </div>
            <p className="product-description">{description}</p>
            <div className="label-value-container">
              <p className="label">Availability</p>
              <p className="value">{availability}</p>
            </div>
            <div className="label-value-container">
              <p className="label">Brand</p>
              <p className="value">{brand}</p>
            </div>
            <hr className="horizontal-line" />
            <div className="quentity-container">
              {/* eslint-disable-next-line */}
              <button
                type="button"
                className="quentity-control-button"
                onClick={this.onDecrementQuantity}
                data-testid="minus"
              >
                <BsDashSquare className="quentity-control-icon" />
              </button>
              <p className="quantity">{quantity}</p>
              {/* eslint-disable-next-line */}
              <button
                type="button"
                className="quentity-control-button"
                onClick={this.onIncrementQuantity}
                data-testid="plus"
              >
                <BsPlusSquare className="quentity-control-icon" />
              </button>
            </div>
          </div>
          <button className="add-to-cart-btn button" type="button">
            ADD TO CART
          </button>
        </div>
        <h1 className="similar-products-heading">Similar Products</h1>
        <ul>
          {similarProductData.map(eachItem => (
            <SimilarProductItem productDetails={eachItem} key={eachItem.id} />
          ))}
        </ul>
      </div>
    )
  }

  renderProductDetails = () => {
    const {apiStatus} = this.state
    switch (apiStatus) {
      case apiStatusConstants.succes:
        return this.renderProductDetailView()
      case apiStatusConstants.failure:
        return this.renderFailureView()
      case apiStatusConstants.inProgress:
        return this.renderLoadindView()
      default:
        return null
    }
  }

  render() {
    return (
      <>
        <Header />
        <div className="product-item-detail-container">
          {this.renderProductDetails()}
        </div>
      </>
    )
  }
}

export default ProductItemDetails
