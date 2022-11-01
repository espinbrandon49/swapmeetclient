import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import ListGroup from 'react-bootstrap/ListGroup';
import Card from 'react-bootstrap/Card';
import { AuthContext } from "../helpers/AuthContext";

const styles = {
  width: {
    width: "200px",
    height: "200px",
  },
};

const Profile = ({ logout }) => {
  let { id } = useParams();
  const [username, setUsername] = useState("");
  const [image, setImage] = useState("");
  const [userCategories, setUserCategories] = useState([]);
  const [userProducts, setUserProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const navigate = useNavigate();
  const { authState, setAuthState } = useContext(AuthContext);

  useEffect(() => {
    axios.get(`https://swapandmeet.herokuapp.com/api/auth/basicinfo/${id}`).then((response) => {
      setUsername(response.data.username);
      setImage(response.data.image);
    });

    axios.get(`https://swapandmeet.herokuapp.com/api/categories/byuserId/${id}`).then((response) => {
      setUserCategories(response.data);
    });

    axios.get(`https://swapandmeet.herokuapp.com/api/products/productbyuserId/${id}`).then((response) => {
      setUserProducts(response.data);
    });

    axios.get("https://swapandmeet.herokuapp.com/api/categories").then((response) => {
      setAllCategories(response.data);
    });
  }, []);

  const editUsername = (defaultValue) => {
    let newUsername = prompt('Enter new shop name', defaultValue);
    let uid = authState.id;
    let pid = userProducts.map((value, i) => value.id);
    let cid = userCategories.map((value, i) => value.id);
    axios
      .put("https://swapandmeet.herokuapp.com/api/auth/changeusername", {
        newUsername: newUsername,
        uid: uid,
        pid: pid,
        cid: cid
      },
        {
          headers: { accessToken: localStorage.getItem("accessToken") },
        }
      )
      .then((response) => {
        if (response.data.error) {
          alert(response.data.error);
        } else {
          console.log(response.data.token)
          localStorage.setItem("accessToken", response.data.token)
          setAuthState({
            username: newUsername,
            id: uid,
            status: true
          });
        }
      });
    setAuthState({ ...authState, username: newUsername })
    logout()
  }

  const addToCart = (pid) => {
    axios
      .post('https://swapandmeet.herokuapp.com/api/products/addtocart',
        {
          pid:pid
        },
        {
          headers: { accessToken: localStorage.getItem("accessToken") },
        })
      .then((response) => {
        console.log(response.data)
      });
  }

  return (
    <div className="container text-center ">

      <div className="my-3 border-5 border-warning border-bottom pb-1 mx-auto w-75">
        <h1 className="lobster">{authState.username === username ? "Your Shop" : username}</h1>

        {authState.id == id &&
          <button onClick={() => editUsername(authState.username)}  > update name</button>
        }
        <img className="yellowDotBorder m-3 p-2 bg-white" src={`https://swapandmeet.herokuapp.com/public/image-${image}`} style={styles.width} alt=" " />
      </div>

      <div className="mb-3" >
        <h4 className="openSans mb-3 fs-2 ">Categories</h4>
        {userCategories.map((value, key) => {
          return (
            <>
              <div
                className="purpleDotBorder mx-5 mb-5"
                style={{ backgroundColor: "#fff3cd" }}
                key={value.id + 100}
              >
                <ListGroup action variant="primary"
                  key={value.id}
                  className="lobster fs-3 w-50 mx-auto my-3"
                  onClick={() => {
                    navigate(`/category/${value.id}`);
                  }}
                >
                  <ListGroup.Item action variant="primary" key={value.id + 200}>
                    {value.category_name}
                  </ListGroup.Item>
                </ListGroup>
                <div key={value.id + 300} className="d-flex justify-content-center m-3 flex-wrap">
                  {userProducts
                    .filter((category, i) => category.categoryName === value.category_name)
                    .map((product, i) => (
                      <Card
                        style={{ width: '10rem' }}
                        key={product.id + 400}
                        className="m-3 openSans "
                      >
                        <Card.Img
                          className="p-1 "
                          variant="top"
                          src={`https://swapandmeet.herokuapp.com/public/image-${product.image}`} />
                        <Card.Title>{product.product_name}</Card.Title>
                        <ListGroup className="list-group-flush " key={value.id + 500}>
                          <ListGroup.Item className="" key={value.id + 600}>Price: {product.price} </ListGroup.Item>
                          <ListGroup.Item>Stock: {product.stock} </ListGroup.Item>
                        </ListGroup>
                        <Card.Body className="" >
                          {authState.id == id
                            ? <button type="button" className="btn btn-secondary w-100" onClick={() => {
                              navigate(`/category/${product.category_id}`);
                            }}>Update</button>
                            : <button type="button" className="btn btn-secondary w-100" onClick={() => {
                              addToCart(product.id);
                            }}>Add To Cart</button>
                          }
                        </Card.Body>
                      </Card>
                    )
                    )
                  }
                </div>
              </div>
            </>
          );
        })}
      </div>
    </div>
  );
};

export default Profile;