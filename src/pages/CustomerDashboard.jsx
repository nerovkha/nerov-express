import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../services/firebase";

function CustomerDashboard() {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [travelTime, setTravelTime] = useState("");
  const [distance, setDistance] = useState("");
  const [bookings, setBookings] = useState([]);

  const routes = {
    "Helsinki Airport-Kamppi Helsinki": 22,
    "Helsinki Airport-Espoo Centre": 18,
    "Pasila Helsinki-Helsinki Airport": 15,
    "Helsinki Central Railway Station-Espoo Centre": 20,
    "Kamppi Helsinki-Helsinki Airport": 22,
  };

  const fare = (
    Number(distance || 0) * 1.5
  ).toFixed(2);

  useEffect(() => {
    const unsubscribeAuth =
      onAuthStateChanged(auth, (user) => {
        if (!user) {
          setBookings([]);
          return;
        }

        const bookingsQuery = query(
          collection(db, "bookings"),
          where(
            "customerId",
            "==",
            user.uid
          )
        );

        const unsubscribeBookings =
          onSnapshot(
            bookingsQuery,
            (snapshot) => {
              const bookingData =
                snapshot.docs.map(
                  (doc) => ({
                    id: doc.id,
                    ...doc.data(),
                  })
                );

              setBookings(bookingData);
            }
          );

        return unsubscribeBookings;
      });

    return () => unsubscribeAuth();
  }, []);

  const calculateDistance = () => {
    const route =
      `${pickup}-${destination}`;

    const calculatedDistance =
      routes[route];

    if (!calculatedDistance) {
      alert(
        "Route not found. Please use one of the supported demo routes."
      );
      return;
    }

    setDistance(calculatedDistance);
  };

  const handleBooking = async (e) => {
    e.preventDefault();

    const user = auth.currentUser;

    if (!user) {
      alert("Please login first.");
      return;
    }

    if (!distance) {
      alert(
        "Please calculate the distance first."
      );
      return;
    }

    try {
      await addDoc(
        collection(db, "bookings"),
        {
          customerId: user.uid,
          customerEmail: user.email,
          customerName,
          phone,
          pickup,
          destination,
          travelDate,
          travelTime,
          distance: Number(distance),
          fare: Number(fare),
          status: "pending",
          createdAt:
            new Date().toISOString(),
        }
      );

      alert(
        "Booking request submitted successfully."
      );

      setCustomerName("");
      setPhone("");
      setPickup("");
      setDestination("");
      setTravelDate("");
      setTravelTime("");
      setDistance("");
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="status-pending">
            ⏳ Waiting for Driver Confirmation
          </span>
        );

      case "accepted":
        return (
          <span className="status-accepted">
            ✅ Booking Accepted
          </span>
        );

      case "rejected":
        return (
          <span className="status-rejected">
            ❌ Booking Rejected
          </span>
        );

      case "completed":
        return (
          <span className="status-completed">
            🚕 Ride Completed
          </span>
        );

      default:
        return (
          <span>
            Unknown Status
          </span>
        );
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">

        <h1>Customer Dashboard</h1>

        <form onSubmit={handleBooking}>
          <input
            type="text"
            placeholder="Customer Name"
            value={customerName}
            onChange={(e) =>
              setCustomerName(
                e.target.value
              )
            }
            required
          />

          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value)
            }
            required
          />

          <input
            type="text"
            placeholder="Pickup Location"
            value={pickup}
            onChange={(e) =>
              setPickup(
                e.target.value
              )
            }
            required
          />

          <input
            type="text"
            placeholder="Destination"
            value={destination}
            onChange={(e) =>
              setDestination(
                e.target.value
              )
            }
            required
          />

          <button
            type="button"
            onClick={calculateDistance}
          >
            Estamated Fare
          </button>

          <div className="demo-routes">
            <h4>
              Available Routes
            </h4>

            <ul>
              <li>
                Helsinki Airport →
                Kamppi Helsinki
              </li>

              <li>
                Helsinki Airport →
                Espoo Centre
              </li>

              <li>
                Pasila Helsinki →
                Helsinki Airport
              </li>

              <li>
                Helsinki Central Railway
                Station →
                Espoo Centre
              </li>
            </ul>
          </div>

          {distance && (
            <>
              <p className="distance-display">
                Distance: {distance} km
              </p>

              <h3>
                Estimated Fare: €
                {fare}
              </h3>
            </>
          )}

          <label className="pickup-date">
            Pickup Date
          </label>

          <input
            type="date"
            value={travelDate}
            onChange={(e) =>
              setTravelDate(
                e.target.value
              )
            }
            required
          />

          <label className="pickup-time">
            Pickup Time
          </label>

          <input
            type="time"
            value={travelTime}
            onChange={(e) =>
              setTravelTime(
                e.target.value
              )
            }
            required
          />

          <button type="submit">
            Book Taxi
          </button>
        </form>

        <div className="my-bookings">
          <h2>My Bookings</h2>

          {bookings.length === 0 ? (
            <p className="empty-bookings">
              No bookings found.
            </p>
          ) : (
            bookings
              .sort(
                (a, b) =>
                  new Date(
                    b.createdAt
                  ) -
                  new Date(
                    a.createdAt
                  )
              )
              .map((booking) => (
                <div
                  key={booking.id}
                  className="booking-item"
                >
                  <h4>
                    📍 {booking.pickup}
                    {" → "}
                    {booking.destination}
                  </h4>

                  <div className="booking-details">
                    <p>
                      <strong>Date:</strong>{" "}
                      {booking.travelDate}
                    </p>

                    <p>
                      <strong>Time:</strong>{" "}
                      {booking.travelTime}
                    </p>

                    <p>
                      <strong>Distance:</strong>{" "}
                      {booking.distance} km
                    </p>

                    <p>
                      <strong>Fare:</strong>{" "}
                      €{booking.fare}
                    </p>
                  </div>

                  <div className="booking-status-row">
                    <strong>Status:</strong>{" "}
                    {getStatusBadge(
                      booking.status
                    )}
                  </div>
                </div>
              ))
          )}
        </div>

      </div>
    </div>
  );
}

export default CustomerDashboard;


// import { useState } from "react";
// import { collection, addDoc } from "firebase/firestore";
// import { auth, db } from "../services/firebase";

// function CustomerDashboard() {
//   const [customerName, setCustomerName] = useState("");
//   const [phone, setPhone] = useState("");
//   const [pickup, setPickup] = useState("");
//   const [destination, setDestination] = useState("");
//   const [travelDate, setTravelDate] = useState("");
//   const [travelTime, setTravelTime] = useState("");
//   const [distance, setDistance] = useState("");
//   const [bookingStatus, setBookingStatus] = useState("");

//   const routes = {
//     "Helsinki Airport-Kamppi Helsinki": 22,
//     "Helsinki Airport-Espoo Centre": 18,
//     "Pasila Helsinki-Helsinki Airport": 15,
//     "Helsinki Central Railway Station-Espoo Centre": 20,
//     "Kamppi Helsinki-Helsinki Airport": 22,
//   };

//   const fare = (
//     Number(distance || 0) * 1.5
//   ).toFixed(2);

//   const calculateDistance = () => {
//     const route = `${pickup}-${destination}`;

//     const calculatedDistance = routes[route];

//     if (!calculatedDistance) {
//       alert(
//         "Route not found. Please use one of the supported demo routes."
//       );
//       return;
//     }

//     setDistance(calculatedDistance);
//   };

//   const handleBooking = async (e) => {
//     e.preventDefault();

//     if (!distance) {
//       alert(
//         "Please calculate the distance first."
//       );
//       return;
//     }

//     const user = auth.currentUser;

//     if (!user) {
//       alert("Please login first.");
//       return;
//     }

//     try {
//       await addDoc(
//         collection(db, "bookings"),
//         {
//           customerId: user.uid,
//           customerEmail: user.email,
//           customerName,
//           phone,
//           pickup,
//           destination,
//           travelDate,
//           travelTime,
//           distance: Number(distance),
//           fare: Number(fare),
//           status: "pending",
//           createdAt:
//             new Date().toISOString(),
//         }
//       );

//       setBookingStatus(
//         "Booking request submitted. Waiting for driver confirmation."
//       );

//       setCustomerName("");
//       setPhone("");
//       setPickup("");
//       setDestination("");
//       setTravelDate("");
//       setTravelTime("");
//       setDistance("");
//     } catch (error) {
//       console.error(error);
//       alert(error.message);
//     }
//   };

//   return (
//     <div className="dashboard-container">
//       <div className="dashboard-card">
//         <h1>Customer Dashboard</h1>

//         {bookingStatus && (
//           <div className="booking-status">
//             <strong>
//               Booking Status
//             </strong>
//             <br />
//             {bookingStatus}
//           </div>
//         )}

//         <form onSubmit={handleBooking}>
//           <input
//             type="text"
//             placeholder="Customer Name"
//             value={customerName}
//             onChange={(e) =>
//               setCustomerName(
//                 e.target.value
//               )
//             }
//             required
//           />

//           <input
//             type="tel"
//             placeholder="Phone Number"
//             value={phone}
//             onChange={(e) =>
//               setPhone(e.target.value)
//             }
//             required
//           />

//           <input
//             type="text"
//             placeholder="Pickup Location"
//             value={pickup}
//             onChange={(e) =>
//               setPickup(
//                 e.target.value
//               )
//             }
//             required
//           />

//           <input
//             type="text"
//             placeholder="Destination"
//             value={destination}
//             onChange={(e) =>
//               setDestination(
//                 e.target.value
//               )
//             }
//             required
//           />

//           <button
//             type="button"
//             onClick={calculateDistance}
//           >
//             Calculate Fare
//           </button>

//           <div className="demo-routes">
//             <h4>
//               Supported Demo Routes
//             </h4>

//             <ul>
//               <li>
//                 Helsinki Airport →
//                 Kamppi Helsinki
//               </li>
//               <li>
//                 Helsinki Airport →
//                 Espoo Centre
//               </li>
//               <li>
//                 Pasila Helsinki →
//                 Helsinki Airport
//               </li>
//               <li>
//                 Helsinki Central Railway
//                 Station → Espoo Centre
//               </li>
//             </ul>
//           </div>

//           {distance && (
//             <>
//               <p className="distance-display">
//                 Distance: {distance} km
//               </p>

//               <h3>
//                 Estimated Fare: €
//                 {fare}
//               </h3>
//             </>
//           )}

//           <label className="pickup-date">
//             Pickup Date
//           </label>

//           <input
//             type="date"
//             value={travelDate}
//             onChange={(e) =>
//               setTravelDate(
//                 e.target.value
//               )
//             }
//             required
//           />

//           <label className="pickup-time">
//             Pickup Time
//           </label>

//           <input
//             type="time"
//             value={travelTime}
//             onChange={(e) =>
//               setTravelTime(
//                 e.target.value
//               )
//             }
//             required
//           />

//           <button type="submit">
//             Book Taxi
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default CustomerDashboard;





// import { useState } from "react";
// import { collection, addDoc } from "firebase/firestore";
// import { auth, db } from "../services/firebase";

// function CustomerDashboard() {
//   const [customerName, setCustomerName] = useState("");
//   const [phone, setPhone] = useState("");
//   const [pickup, setPickup] = useState("");
//   const [destination, setDestination] = useState("");
//   const [travelDate, setTravelDate] = useState("");
//   const [travelTime, setTravelTime] = useState("");
//   const [distance, setDistance] = useState("");

//   const routes = {
//     "Helsinki Airport-Kamppi Helsinki": 22,
//     "Helsinki Airport-Espoo Centre": 18,
//     "Pasila Helsinki-Helsinki Airport": 15,
//     "Helsinki Central Railway Station-Espoo Centre": 20,
//     "Kamppi Helsinki-Helsinki Airport": 22,
//   };

//   const fare = (
//     Number(distance || 0) * 1.5
//   ).toFixed(2);

//   const calculateDistance = () => {
//     const route = `${pickup}-${destination}`;

//     const calculatedDistance = routes[route];

//     if (!calculatedDistance) {
//       alert(
//         "Route not found. Please use one of the supported demo routes below."
//       );
//       return;
//     }

//     setDistance(calculatedDistance);
//   };

//   const handleBooking = async (e) => {
//     e.preventDefault();

//     if (!distance) {
//       alert("Please calculate the distance first.");
//       return;
//     }

//     try {
//       await addDoc(
//         collection(db, "bookings"),
//         {
//           customerId: auth.currentUser.uid,
//           customerEmail:
//             auth.currentUser.email,
//           customerName,
//           phone,
//           pickup,
//           destination,
//           travelDate,
//           travelTime,
//           distance: Number(distance),
//           fare: Number(fare),
//           status: "pending",
//           createdAt:
//             new Date().toISOString(),
//         }
//       );

//       alert(
//         "Taxi booked successfully!"
//       );

//       setCustomerName("");
//       setPhone("");
//       setPickup("");
//       setDestination("");
//       setTravelDate("");
//       setTravelTime("");
//       setDistance("");
//     } catch (error) {
//       console.error(error);
//       alert(error.message);
//     }
//   };

//   return (
//     <div className="dashboard-container">
//       <div className="dashboard-card">
//         <h1>Customer Dashboard</h1>

//         <form onSubmit={handleBooking}>
//           <input
//             type="text"
//             placeholder="Customer Name"
//             value={customerName}
//             onChange={(e) =>
//               setCustomerName(
//                 e.target.value
//               )
//             }
//             required
//           />

//           <input
//             type="tel"
//             placeholder="Phone Number"
//             value={phone}
//             onChange={(e) =>
//               setPhone(e.target.value)
//             }
//             required
//           />

//           <input
//             type="text"
//             placeholder="Pickup Location"
//             value={pickup}
//             onChange={(e) =>
//               setPickup(
//                 e.target.value
//               )
//             }
//             required
//           />

//           <input
//             type="text"
//             placeholder="Destination"
//             value={destination}
//             onChange={(e) =>
//               setDestination(
//                 e.target.value
//               )
//             }
//             required
//           />

//           <button
//             type="button"
//             onClick={calculateDistance}
//           >
//             Calculate Distance
//           </button>

//           <div className="demo-routes">
//             <h4>
//               Supported Demo Routes
//             </h4>

//             <ul>
//               <li>
//                 Helsinki Airport →
//                 Kamppi Helsinki
//               </li>

//               <li>
//                 Helsinki Airport →
//                 Espoo Centre
//               </li>

//               <li>
//                 Pasila Helsinki →
//                 Helsinki Airport
//               </li>

//               <li>
//                 Helsinki Central Railway
//                 Station → Espoo Centre
//               </li>
//             </ul>
//           </div>

//           {distance && (
//             <>
//               <p className="distance-display">
//                 Distance: {distance} km
//               </p>

//               <h3>
//                 Estimated Fare: €
//                 {fare}
//               </h3>
//             </>
//           )}

//           <label className="pickup-date">
//             Pickup Date
//           </label>

//           <input
//             type="date"
//             value={travelDate}
//             onChange={(e) =>
//               setTravelDate(
//                 e.target.value
//               )
//             }
//             required
//           />

//           <label className="pickup-time">
//             Pickup Time
//           </label>

//           <input
//             type="time"
//             value={travelTime}
//             onChange={(e) =>
//               setTravelTime(
//                 e.target.value
//               )
//             }
//             required
//           />

//           <button type="submit">
//             Book Taxi
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default CustomerDashboard;
// import { useState } from "react";
// import { collection, addDoc } from "firebase/firestore";
// import { auth, db } from "../services/firebase";

// function CustomerDashboard() {
//   const [customerName, setCustomerName] = useState("");
//   const [phone, setPhone] = useState("");
//   const [pickup, setPickup] = useState("");
//   const [destination, setDestination] = useState("");
//   const [distance, setDistance] = useState("");

//   const fare = Number(distance || 0) * 1;

//   const handleBooking = async (e) => {
//     e.preventDefault();

//     try {
//       await addDoc(collection(db, "bookings"), {
//         customerId: auth.currentUser.uid,
//         customerEmail: auth.currentUser.email,
//         customerName,
//         phone,
//         pickup,
//         destination,
//         distance: Number(distance),
//         fare,
//         status: "pending",
//         createdAt: new Date().toISOString(),
//       });

//       alert("Taxi booked successfully!");

//       setCustomerName("");
//       setPhone("");
//       setPickup("");
//       setDestination("");
//       setDistance("");
//     } catch (error) {
//       console.error(error);
//       alert(error.message);
//     }
//   };

//   return (
//     <div className="dashboard-container">
//       <div className="dashboard-card">
//         <h1>Customer Dashboard</h1>

//         <form onSubmit={handleBooking}>
//           <input
//             type="text"
//             placeholder="Customer Name"
//             value={customerName}
//             onChange={(e) => setCustomerName(e.target.value)}
//             required
//           />

//           <input
//             type="tel"
//             placeholder="Phone Number"
//             value={phone}
//             onChange={(e) => setPhone(e.target.value)}
//             required
//           />

//           <input
//             type="text"
//             placeholder="Pickup Location"
//             value={pickup}
//             onChange={(e) => setPickup(e.target.value)}
//             required
//           />

//           <input
//             type="text"
//             placeholder="Destination"
//             value={destination}
//             onChange={(e) => setDestination(e.target.value)}
//             required
//           />

//           <input
//             type="number"
//             placeholder="Distance (km)"
//             value={distance}
//             onChange={(e) => setDistance(e.target.value)}
//             min="1"
//             required
//           />

//           <h3 style={{ marginBottom: "15px" }}>
//             Estimated Fare: €{fare}
//           </h3>

//           <button type="submit">
//             Book Taxi
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default CustomerDashboard;

// import { useState } from "react";
// import axios from "axios";
// import { collection, addDoc } from "firebase/firestore";
// import { auth, db } from "../services/firebase";
// const API_KEY = import.meta.env.VITE_ORS_API_KEY;


// function CustomerDashboard() {
//   const [customerName, setCustomerName] = useState("");
//   const [phone, setPhone] = useState("");
//   const [pickup, setPickup] = useState("");
//   const [destination, setDestination] = useState("");
//   const [travelDate, setTravelDate] = useState("");
//   const [travelTime, setTravelTime] = useState("");
//   const [distance, setDistance] = useState("");

//   const fare = Number(distance || 0);

//   const handleBooking = async (e) => {
//     e.preventDefault();

//     try {
//       await addDoc(collection(db, "bookings"), {
//         customerId: auth.currentUser.uid,
//         customerEmail: auth.currentUser.email,
//         customerName,
//         phone,
//         pickup,
//         destination,
//         travelDate,
//         travelTime,
//         distance: Number(distance),
//         fare,
//         status: "pending",
//         createdAt: new Date().toISOString(),
//       });

//       alert("Taxi booked successfully!");

//       setCustomerName("");
//       setPhone("");
//       setPickup("");
//       setDestination("");
//       setTravelDate("");
//       setTravelTime("");
//       setDistance("");
//     } catch (error) {
//       console.error(error);
//       alert(error.message);
//     }
//   };

//   return (
//     <div className="dashboard-container">
//       <div className="dashboard-card">
//         <h1>Customer Dashboard</h1>

//         <form onSubmit={handleBooking}>
//           <input
//             type="text"
//             placeholder="Customer Name"
//             value={customerName}
//             onChange={(e) => setCustomerName(e.target.value)}
//             required
//           />

//           <input
//             type="tel"
//             placeholder="Phone Number"
//             value={phone}
//             onChange={(e) => setPhone(e.target.value)}
//             required
//           />

//           <input
//             type="text"
//             placeholder="Pickup Location"
//             value={pickup}
//             onChange={(e) => setPickup(e.target.value)}
//             required
//           />

//           <input
//             type="text"
//             placeholder="Destination"
//             value={destination}
//             onChange={(e) => setDestination(e.target.value)}
//             required
//           />

//           <label className="pickup-date">Pickup Date</label>
//           <input
//             type="date"
//             value={travelDate}
//             onChange={(e) => setTravelDate(e.target.value)}
//             required
//           />

//           <label className="pickup-time">Pickup Time</label>
//           <input
//             type="time"
//             value={travelTime}
//             onChange={(e) => setTravelTime(e.target.value)}
//             required
//           />

//           <input
//             type="number"
//             placeholder="Distance (km)"
//             value={distance}
//             onChange={(e) => setDistance(e.target.value)}
//             min="1"
//             required
//           />

//           <h3>
//             Estimated Fare: €{fare}
//           </h3>

//           <button type="submit">
//             Book Taxi
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default CustomerDashboard;
// import { useState } from "react";
// import { collection, addDoc } from "firebase/firestore";
// import { auth, db } from "../services/firebase";

// function CustomerDashboard() {
//   const [customerName, setCustomerName] = useState("");
//   const [phone, setPhone] = useState("");
//   const [pickup, setPickup] = useState("");
//   const [destination, setDestination] = useState("");
//   const [travelDate, setTravelDate] = useState("");
//   const [travelTime, setTravelTime] = useState("");
//   const [distance, setDistance] = useState("");

//   const routes = {
//     "Helsinki Airport-Kamppi Helsinki": 22,
//     "Helsinki Airport-Espoo Centre": 18,
//     "Pasila Helsinki-Helsinki Airport": 15,
//     "Helsinki Central Railway Station-Espoo Centre": 20,
//     "Kamppi Helsinki-Helsinki Airport": 22,
//   };

//   const fare = (
//     Number(distance || 0) * 1.5
//   ).toFixed(2);

//   const calculateDistance = () => {
//     const route =
//       `${pickup}-${destination}`;

//     const calculatedDistance =
//       routes[route];

//     if (!calculatedDistance) {
//       alert(
//         "Route not found. Try one of the predefined routes."
//       );
//       return;
//     }

//     setDistance(calculatedDistance);
//   };

//   const handleBooking = async (e) => {
//     e.preventDefault();

//     try {
//       await addDoc(
//         collection(db, "bookings"),
//         {
//           customerId:
//             auth.currentUser.uid,
//           customerEmail:
//             auth.currentUser.email,
//           customerName,
//           phone,
//           pickup,
//           destination,
//           travelDate,
//           travelTime,
//           distance:
//             Number(distance),
//           fare:
//             Number(fare),
//           status: "pending",
//           createdAt:
//             new Date().toISOString(),
//         }
//       );

//       alert(
//         "Taxi booked successfully!"
//       );

//       setCustomerName("");
//       setPhone("");
//       setPickup("");
//       setDestination("");
//       setTravelDate("");
//       setTravelTime("");
//       setDistance("");
//     } catch (error) {
//       console.error(error);
//       alert(error.message);
//     }
//   };

//   return (
//     <div className="dashboard-container">
//       <div className="dashboard-card">
//         <h1>Customer Dashboard</h1>

//         <form onSubmit={handleBooking}>
//           <input
//             type="text"
//             placeholder="Customer Name"
//             value={customerName}
//             onChange={(e) =>
//               setCustomerName(
//                 e.target.value
//               )
//             }
//             required
//           />

//           <input
//             type="tel"
//             placeholder="Phone Number"
//             value={phone}
//             onChange={(e) =>
//               setPhone(e.target.value)
//             }
//             required
//           />

//           <input
//             type="text"
//             placeholder="e.g. Helsinki Airport"
//             value={pickup}
//             onChange={(e) =>
//               setPickup(
//                 e.target.value
//               )
//             }
//             required
//           />

//           <input
//             type="text"
//             placeholder="e.g. Kamppi Helsinki"
//             value={destination}
//             onChange={(e) =>
//               setDestination(
//                 e.target.value
//               )
//             }
//             required
//           />

//           <button
//             type="button"
//             onClick={
//               calculateDistance
//             }
//           >
//             Calculate Distance
//           </button>

//           {distance && (
//             <>
//               <p className="distance-display">
//                 Distance:
//                 {" "}
//                 {distance}
//                 {" "}
//                 km
//               </p>

//               <h3>
//                 Estimated Fare:
//                 €
//                 {fare}
//               </h3>
//             </>
//           )}

//           <label className="pickup-date">
//             Pickup Date
//           </label>

//           <input
//             type="date"
//             value={travelDate}
//             onChange={(e) =>
//               setTravelDate(
//                 e.target.value
//               )
//             }
//             required
//           />

//           <label className="pickup-time">
//             Pickup Time
//           </label>

//           <input
//             type="time"
//             value={travelTime}
//             onChange={(e) =>
//               setTravelTime(
//                 e.target.value
//               )
//             }
//             required
//           />

//           <button type="submit">
//             Book Taxi
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default CustomerDashboard;