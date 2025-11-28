import React, { useEffect, useState } from "react";
import withLayout from "../../../../core/layout";
import { ElementContainer, Title } from "../../../../core/elements";
import { SubPageHeader } from "../../../../core/input/heading";
import { getData, putData } from "../../../../../backend/api";

import FormInput from "../../../../core/input";
import { ColumnContainer } from "../../../../styles/containers/styles";
import ListTable from "../../../../core/list/list";
import AutoForm from "../../../../core/autoform/AutoForm";

const Payment = (props) => {
  const eventId = props?.openData?.data?._id;
  const [selectedCountry, setSelectedCountry] = useState();
  const [countries, setCountries] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState();
  const [currencies, setCurrencies] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  // State to control the display of the SetupMenu popup
  const [openMenuSetup, setOpenMenuSetup] = useState(false);
  // State to store the data for the item that was clicked on in the ListTable
  const [openItemData, setOpenItemData] = useState(null);
  const [lastUpdateDate, setLastUpdateDate] = useState(null);

  // Function to close the SetupMenu popup
  const closeModal = () => {
    setOpenMenuSetup(false);
    setOpenItemData(null);
    setSelectedCountry(null);
    setSelectedCurrency(null);
    setLastUpdateDate(new Date());
  };

  useEffect(() => {
    getData({}, "country/select").then((response) => {
      setCountries(response?.data);
    });
    getData({}, "currency/select").then((response) => {
      setCurrencies(response?.data);
    });
  }, []);

  const [attributes] = useState([
    {
      type: "select",
      apiType: "API",
      selectApi: "event/select",
      placeholder: "Event",
      name: "event",
      validation: "",
      showItem: "title",
      default: "",
      label: "Event",
      required: false,
      view: false,
      tag: false,
      add: false,
      update: false,
      filter: false,
    },
    {
      type: "select",
      apiType: "API",
      selectApi: "country/select",
      placeholder: "Country",
      name: "country",
      validation: "",
      showItem: "title",
      default: "",
      label: "Country",
      required: false,
      view: true,
      tag: false,
      add: false,
      update: false,
      filter: false,
    },
    {
      type: "select",
      apiType: "API",
      selectApi: "currency/select",
      placeholder: "Currency",
      name: "currency",
      validation: "",
      showItem: "title",
      default: "",
      label: "Currency",
      required: false,
      view: true,
      tag: false,
      add: false,
      update: false,
      filter: false,
    },
    {
      type: "select",
      placeholder: "Gateways",
      name: "gateways",
      validation: "",
      default: "",
      tag: false,
      label: "Gateways",
      showItem: "",
      required: false,
      view: true,
      filter: false,
      add: true,
      update: false,
      apiType: "CSV",
      selectApi: "Eventhex, Other",
    },
    {
      type: "select",
      placeholder: "Method",
      name: "method",
      validation: "",
      default: "",
      tag: true,
      label: "Method",
      showItem: "Method",
      required: false,
      view: true,
      filter: false,
      add: false,
      update: false,
      apiType: "CSV",
      selectApi: "Eventhex, Offline Payment, Razorpay, Stripe",
    },
    {
      type: "toggle",
      placeholder: "Enable",
      name: "status",
      validation: "",
      default: "",
      tag: true,
      label: "Enable",
      required: false,
      view: true,
      add: false,
      update: false,
    },
    {
      type: "text",
      placeholder: "Title",
      name: "title",
      validation: "",
      default: "",
      label: "Title",
      tag: false,
      required: false,
      view: false,
      add: false,
      update: false,
    },
    {
      type: "textarea",
      placeholder: "Description",
      name: "description",
      validation: "",
      default: "",
      label: "Description",
      tag: true,
      required: false,
      view: true,
      add: false,
      update: false,
    },
    {
      type: "text",
      placeholder: "Key ID",
      name: "key_id",
      validation: "",
      default: "",
      label: "Key ID",
      tag: false,
      required: false,
      view: false,
      add: false,
      update: false,
    },
    {
      type: "text",
      placeholder: "Key Secret",
      name: "key_secret",
      validation: "",
      default: "",
      label: "Key Secret",
      tag: false,
      required: false,
      view: false,
      add: false,
      update: false,
    },
    {
      type: "textarea",
      placeholder: "Payment Instructions",
      name: "paymentInstructions",
      validation: "",
      default: "",
      label: "Payment Instructions",
      tag: false,
      required: false,
      view: false,
      add: false,
      update: false,
    },
  ]);

  const actions = [
    {
      element: "button",
      type: "callback",
      callback: (item, data) => {
        if (data?.method === "Eventhex") {
          props.setMessage({
            type: 2,
            content: "Do You Want To Enable EventHex Payment Gateway?",
            proceed: "Yes",
            okay: "No",
            onClose: async () => {
              return true;
            },
            onProceed: async () => {
              const post = {
                status: true,
                openItemData: data,
                description: "Allow customers to securely pay via EventHex Gateway (Credit/Debit Cards, NetBanking, UPI, Wallets)",
              };
              submitChange(post);
              //return false if this second message to show..
              return false;
            },
            data: { id: 1 },
          });
        } else {
          setOpenItemData({ item, data });
          setOpenMenuSetup(true);
        }
      },
      itemTitle: {
        name: "title",
        type: "text",
        collection: "",
      },
      icon: "",
      title: "Set up",
      params: {
        api: ``,
        parentReference: "",
        itemTitle: {
          name: "title",
          type: "text",
          collection: "",
        },
        shortName: "Set up",
        addPrivilege: true,
        delPrivilege: true,
        updatePrivilege: true,
        customClass: "full-page",
      },
    },
  ];

  const [razorpayPaymentGatewayInput] = useState([
    {
      type: "toggle",
      placeholder: "Enable",
      name: "status",
      validation: "",
      default: "",
      tag: true,
      label: "Enable",
      info: "Enable this module?",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Title",
      name: "title",
      validation: "",
      default: "Credit Card/Debit Card/NetBanking",
      label: "Title",
      info: "This controls the title which the user sees during checkout.",
      tag: false,
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "textarea",
      placeholder: "Description",
      name: "description",
      validation: "",
      default: "Pay securely by Credit or Debit card or Internet Banking through Razorpay.",
      label: "Description",
      info: "This controls the description which the user sees during checkout.",
      tag: false,
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Key ID",
      name: "key_id",
      validation: "",
      default: "",
      label: "Key ID",
      tag: false,
      info: "The key Id and key secret can be generated from `API Keys` section of Razorpay Dashboard. Use test or live for test or live mode.",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Key Secret",
      name: "key_secret",
      validation: "",
      default: "",
      label: "Key Secret",
      tag: false,
      info: "The key Id and key secret can be generated from `API Keys` section of Razorpay Dashboard. Use test or live for test or live mode.",
      required: true,
      view: true,
      add: true,
      update: true,
    },
  ]);
  const [stripePaymentGatewayInput] = useState([
    {
      type: "toggle",
      placeholder: "Enable",
      name: "status",
      validation: "",
      default: "",
      tag: true,
      label: "Enable",
      info: "Enable this module?",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Title",
      name: "title",
      validation: "",
      default: "Credit Card/Debit Card/NetBanking",
      label: "Title",
      info: "This controls the title which the user sees during checkout.",
      tag: false,
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "textarea",
      placeholder: "Description",
      name: "description",
      validation: "",
      default: "Stripe is an online payment processing platform that allows you to receive one-time payments securely from customers.",
      label: "Description",
      info: "This controls the description which the user sees during checkout.",
      tag: false,
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Key ID",
      name: "key_id",
      validation: "",
      default: "",
      label: "Key ID",
      tag: false,
      info: "The key Id and key secret can be generated from `API Keys` section of Razorpay Dashboard. Use test or live for test or live mode.",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Key Secret",
      name: "key_secret",
      validation: "",
      default: "",
      label: "Key Secret",
      tag: false,
      info: "The key Id and key secret can be generated from `API Keys` section of Razorpay Dashboard. Use test or live for test or live mode.",
      required: true,
      view: true,
      add: true,
      update: true,
    },
  ]);

  const [payAtVenue] = useState([
    {
      type: "toggle",
      placeholder: "Enable",
      name: "status",
      validation: "",
      default: "",
      tag: true,
      label: "Enable",
      info: "Enable this module?",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "textarea",
      placeholder: "Payment Instructions",
      name: "paymentInstructions",
      validation: "",
      default: "",
      label: "Payment Instructions",
      info: "Displays to customers after they place an order with this payment method.",
      tag: false,
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "hidden",
      placeholder: "Description",
      name: "description",
      validation: "",
      default: "Collect payments from attendees at the event venue.",
      label: "Description",
      tag: false,
      required: false,
      view: true,
      add: true,
      update: true,
    },
  ]);

  const submitChange = async (post) => {
    if (!selectedCountry || !selectedCurrency) {
      let message = "Please Select Your ";

      if (!selectedCountry && !selectedCurrency) {
        message += "Country and Currency.";
      } else if (!selectedCountry) {
        message += "Country.";
      } else if (!selectedCurrency) {
        message += "Currency.";
      }

      props?.setMessage({
        type: 1,
        content: message,
        okay: "Okay",
        icon: "error",
      });
    } else {
      const status = post.status;
      const paymentInstructions = post.paymentInstructions ? post.paymentInstructions : "";
      const title = post.title ? post.title : "";
      const description = post.description ? post.description : "";
      const key_id = post.key_id ? post.key_id : "";
      const key_secret = post.key_secret ? post.key_secret : "";
      const data = post.openItemData ? post.openItemData : openItemData.data;
      const id = data._id;
      const country = selectedCountry?.id;
      const currency = selectedCurrency?.id;
      const event = eventId;

      putData(
        {
          id,
          event,
          country,
          currency,
          status,
          paymentInstructions,
          title,
          description,
          key_id,
          key_secret,
        },
        "payment-setting"
      ).then((response) => {
        if (response?.data?.success === true) {
          props?.setMessage({
            type: 1,
            content: response?.data?.message,
            okay: "Okay",
            icon: "success",
          });
          closeModal();
        }
      });
    }

    // write your code here
  };

  return (
    <ElementContainer className="column">
      <Title title="Payments" line={false}></Title>
      <ColumnContainer className="direct gap">
        <FormInput
          label="Country/State"
          placeholder="Select Your Country"
          info="Please select any one option"
          type="select"
          required={true}
          apiType="JSON"
          selectApi={countries}
          value={selectedCountry || { id: undefined, value: "Select Your Country" }} // Reset to default when null
          onChange={(e) => {
            if (e?.id === undefined) {
              // If the user clicks the already selected item, clear the selection
              setSelectedCountry(null);
            } else {
              // Set the newly selected country
              setSelectedCountry(e);
            }
          }}
        />
        <FormInput
          label="Currency"
          placeholder="Select Your Currency"
          info="Please select any one option"
          type="select"
          required={true}
          apiType="JSON"
          selectApi={currencies}
          value={selectedCurrency || { id: undefined, value: "Select Your Currency" }} // Reset to default when null
          onChange={(e) => {
            if (e?.id === undefined) {
              // If the user clicks the already selected item, clear the selection
              setSelectedCurrency(null);
            } else {
              setSelectedCurrency(e); // Set the selected country
            }
          }}
        />
      </ColumnContainer>

      <SubPageHeader title="Payment Methods" line={false} description={"Available payment methods are listed below and can be sorted to control their display order on the frontend."}></SubPageHeader>
      <ColumnContainer className="direct gap">
        <FormInput
          label="How Do You Want To Collect Payments"
          placeholder="Select Your Payment Method"
          info="Please select any one option"
          type="select"
          required={true}
          apiType="JSON"
          selectApi={[
            { id: "Eventhex", value: "EventHex Gateway" },
            { id: "Other", value: "Other Payment Providers" },
          ]}
          value={selectedPaymentMethod}
          radioButton={true}
          onChange={(value) => {
            setSelectedPaymentMethod(value); // Set the selected country
            setLastUpdateDate(new Date());
          }}
        />
      </ColumnContainer>
      {selectedPaymentMethod.id === "Eventhex" && (
        <ElementContainer className="bottom">
          <ListTable
            actions={actions}
            api={`payment-setting`}
            key={"Eventhex"}
            itemTitle={{
              name: "title",
              type: "text",
              collection: "",
            }}
            // parentReference={("event", "gateways")}
            // referenceId={(eventId, "Eventhex")}
            // parents={{ gateways: "Eventhex", event: eventId }}
            shortName={`Payment Setting`}
            formMode={`single`}
            preFilter={{ gateways: "Eventhex", event: eventId }}
            viewMode="table"
            {...props}
            attributes={attributes}
            // delPrivilege={true}
            // updatePrivilege={true}
            lastUpdateDate={lastUpdateDate}
          ></ListTable>
        </ElementContainer>
      )}
      {selectedPaymentMethod.id === "Other" && (
        <ElementContainer className="bottom">
          <ListTable
            actions={actions}
            key={"Other"}
            api={`payment-setting`}
            itemTitle={{
              name: "title",
              type: "text",
              collection: "",
            }}
            attributes={attributes}
            // parents={{ gateways: "Other", event: eventId }}
            preFilter={{ gateways: "Other", event: eventId }}
            // parentReference={("event", "gateways")}
            // referenceId={(eventId, "Other")}
            shortName={`Payment Setting`}
            formMode={`single`}
            viewMode="table"
            lastUpdateDate={lastUpdateDate}
            {...props}
          ></ListTable>
        </ElementContainer>
      )}

      {openItemData && openMenuSetup && (
        <AutoForm
          useCaptcha={false}
          key={"elements"}
          formType={"post"}
          header={openItemData?.data?.method}
          description={""}
          formInput={openItemData?.data?.method === "Offline Payment" ? payAtVenue : openItemData?.data?.method === "Razorpay" ? razorpayPaymentGatewayInput : stripePaymentGatewayInput}
          //   formValues={ticketFormValues}
          submitHandler={submitChange}
          button={"Save"}
          isOpenHandler={closeModal}
          isOpen={true}
          plainForm={true}
          formMode={"single"}
        ></AutoForm>
      )}
    </ElementContainer>
  );
};

export default withLayout(Payment);
