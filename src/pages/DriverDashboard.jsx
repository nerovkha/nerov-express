import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../services/firebase";

function DriverDashboard() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "bookings"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setBookings(data);
      }
    );

    return () => unsubscribe();
  }, []);

  const acceptBooking = async (bookingId) => {
    try {
      await updateDoc(
        doc(db, "bookings", bookingId),
        {
          status: "accepted",
          driverId: auth.currentUser.uid,
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  const rejectBooking = async (bookingId) => {
    try {
      await updateDoc(
        doc(db, "bookings", bookingId),
        {
          status: "rejected",
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  const completeBooking = async (bookingId) => {
    try {
      await updateDoc(
        doc(db, "bookings", bookingId),
        {
          status: "completed",
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="status-pending">
            ⏳ Pending
          </span>
        );

      case "accepted":
        return (
          <span className="status-accepted">
            ✅ Accepted
          </span>
        );

      case "rejected":
        return (
          <span className="status-rejected">
            ❌ Rejected
          </span>
        );

      case "completed":
        return (
          <span className="status-completed">
            🚕 Completed
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
        <h1>Driver Dashboard</h1>

        {bookings.length === 0 ? (
          <p>No bookings available.</p>
        ) : (
          bookings
            .sort(
              (a, b) =>
                new Date(b.createdAt) -
                new Date(a.createdAt)
            )
            .map((booking) => (
              <div
                key={booking.id}
                className="booking-item"
              >
                <h4>
                  📍 {booking.pickup} →
                  {booking.destination}
                </h4>

                <div className="booking-details">
                  <p>
                    <strong>Customer:</strong>{" "}
                    {booking.customerName}
                  </p>

                  <p>
                    <strong>Phone:</strong>{" "}
                    {booking.phone}
                  </p>

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

                {booking.status ===
                  "pending" && (
                  <div className="button-group">
                    <button
                      className="accept-btn"
                      onClick={() =>
                        acceptBooking(
                          booking.id
                        )
                      }
                    >
                      Accept Booking
                    </button>

                    <button
                      className="reject-btn"
                      onClick={() =>
                        rejectBooking(
                          booking.id
                        )
                      }
                    >
                      Reject Booking
                    </button>
                  </div>
                )}

                {booking.status ===
                  "accepted" && (
                  <button
                    className="complete-btn"
                    onClick={() =>
                      completeBooking(
                        booking.id
                      )
                    }
                  >
                    Complete Ride
                  </button>
                )}
              </div>
            ))
        )}
      </div>
    </div>
  );
}

export default DriverDashboard;


// import { useEffect, useState } from "react";
// import {
//   collection,
//   getDocs,
//   doc,
//   updateDoc,
// } from "firebase/firestore";
// import { auth, db } from "../services/firebase";

// function DriverDashboard() {
//   const [bookings, setBookings] = useState([]);

//   useEffect(() => {
//     fetchBookings();
//   }, []);

//   const fetchBookings = async () => {
//     try {
//       const querySnapshot = await getDocs(
//         collection(db, "bookings")
//       );

//       const data = querySnapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));

//       setBookings(data);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const acceptBooking = async (bookingId) => {
//     try {
//       await updateDoc(
//         doc(db, "bookings", bookingId),
//         {
//           status: "accepted",
//           driverId: auth.currentUser.uid,
//         }
//       );

//       alert("Booking accepted!");
//       fetchBookings();
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const rejectBooking = async (bookingId) => {
//     try {
//       await updateDoc(
//         doc(db, "bookings", bookingId),
//         {
//           status: "rejected",
//         }
//       );

//       alert("Booking rejected!");
//       fetchBookings();
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const completeBooking = async (bookingId) => {
//     try {
//       await updateDoc(
//         doc(db, "bookings", bookingId),
//         {
//           status: "completed",
//         }
//       );

//       alert("Ride completed!");
//       fetchBookings();
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   return (
//     <div className="dashboard-container">
//       <div className="dashboard-card">
//         <h1>Driver Dashboard</h1>

//         {bookings.length === 0 ? (
//           <p>No bookings available.</p>
//         ) : (
//           bookings.map((booking) => (
//             <div
//               key={booking.id}
//               className="booking-card"
//             >
//               <p>
//                 <strong>Customer:</strong>{" "}
//                 {booking.customerName || "N/A"}
//               </p>

//               <p>
//                 <strong>Phone:</strong>{" "}
//                 {booking.phone || "N/A"}
//               </p>

//               <p>
//                 <strong>Pickup:</strong>{" "}
//                 {booking.pickup}
//               </p>

//               <p>
//                 <strong>Destination:</strong>{" "}
//                 {booking.destination}
//               </p>

//               <p>
//                 <strong>Distance:</strong>{" "}
//                 {booking.distance || 0} km
//               </p>

//               <p>
//                 <strong>Fare:</strong> €
//                 {booking.fare || 0}
//               </p>

//               <p>
//                 <strong>Status:</strong>{" "}
//                 {booking.status}
//               </p>

//               {booking.status === "pending" && (
//                 <div className="button-group">
//                   <button
//                     onClick={() =>
//                       acceptBooking(booking.id)
//                     }
//                   >
//                     Accept Booking
//                   </button>

//                   <button
//                     className="reject-btn"
//                     onClick={() =>
//                       rejectBooking(booking.id)
//                     }
//                   >
//                     Reject Booking
//                   </button>
//                 </div>
//               )}

//               {booking.status === "accepted" && (
//                 <button
//                   className="complete-btn"
//                   onClick={() =>
//                     completeBooking(booking.id)
//                   }
//                 >
//                   Complete Ride
//                 </button>
//               )}
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// }

// export default DriverDashboard;