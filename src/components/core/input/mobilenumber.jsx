import React, { useEffect, useRef, useState } from "react";
import InfoBoxItem from "./info";
import CustomLabel from "./label";
import { CountryCode, Input, InputContainer } from "./styles";
import ErrorLabel from "./error";
import Footnote from "./footnote";
import { GetIcon } from "../../../icons";

export const MobileNumber = (props) => {
  const [country, setCountry] = useState(() => {
    if (props.value?.country) {
      const temp = props.countries.filter((country) => country.phoneCode === props.value.country);

      return temp?.[0] ?? props.countries?.[0] ?? {};
    } else {
      return props.countries?.[0] ?? {};
    }
  });
  const [openCountry, setOpenCountry] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  // console.log(props.label,props.value)
  const { themeColors } = props;
  const countryRef = useRef(null); // Ref to track the country dropdown
  const searchRef = useRef(null); // Ref to track the search input

  const handleClickOutside = (event) => {
    if (countryRef.current && !countryRef.current.contains(event.target)) {
      setOpenCountry(false);
      setSearchTerm(""); // Clear search when closing dropdown
    }
  };

  useEffect(() => {
    // Add event listener for clicks outside
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Clean up event listener on component unmount
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter countries based on search term
  const filteredCountries = props.countries.filter((countryItem) => {
    const searchLower = searchTerm.toLowerCase();
    const phoneCodeStr = countryItem.phoneCode?.toString() || "";
    return countryItem.title?.toLowerCase().includes(searchLower) || phoneCodeStr.includes(searchTerm);
  });

  let value1 = isNaN(props.value?.number) ? null : props.value?.number;
  const handleKeyDown1 = (event) => {
    if (event.keyCode === 38 || event.keyCode === 40) {
      // Prevent the default behavior for up and down arrow keys
      console.log("event", "aborted");
      event.preventDefault();
    }
  };

  const handleCountrySelect = (countryItem, e) => {
    console.log({ countryItem }); // Log for debugging
    setOpenCountry(false);
    setCountry(countryItem);
    setSearchTerm(""); // Clear search when selecting a country
    props.onChange({ target: { value: value1 } }, props.id, props.type, props.sub, countryItem);
    e.stopPropagation();
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  return (
    <InputContainer className={`${props.dynamicClass ?? ""} ${props.customClass ?? ""}`} animation={props.animation}>
      <InfoBoxItem info={props.info} />
      <CustomLabel name={props.name} label={props.label} required={props.required} sublabel={props.sublabel} error={props.error ?? ""} />
      <div className="flex items-center gap-2 relative">
        <CountryCode
          ref={countryRef} //
          className="country"
          onClick={() => {
            setOpenCountry((prev) => !prev);
            if (!openCountry) {
              // Focus search input when opening dropdown
              setTimeout(() => {
                searchRef.current?.focus();
              }, 100);
            }
          }}
        >
          <span> {`${country.flag} +${country.phoneCode}`}</span> <GetIcon icon={"down1"}></GetIcon>
          {openCountry && (
            <div className="options">
              {/* Custom Search Input */}
              <div style={{ padding: "12px", borderBottom: "1px solid #e5e7eb", position: "sticky", top: "0", backgroundColor: "white", zIndex: "1" }}>
                <div style={{ position: "relative", width: "100%" }}>
                  <div
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      zIndex: "2",
                      pointerEvents: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <GetIcon icon="search" style={{ width: "16px", height: "16px", color: "#6b7280" }} />
                  </div>
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder="Search options..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    style={{ width: "100%", padding: "10px 12px 10px 40px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  {searchTerm.length > 0 && (
                    <button
                      onClick={handleClearSearch}
                      style={{
                        position: "absolute",
                        right: "8px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "4px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <GetIcon icon="close" style={{ width: "14px", height: "14px", color: "#6b7280" }} />
                    </button>
                  )}
                </div>
              </div>

              {/* Filtered countries list */}
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((countryItem, index) => {
                    return (
                      <React.Fragment key={index}>
                        {index > 0 && <div className="line"></div>}
                        <div
                          className={`option ${countryItem.phoneCode === country.phoneCode ? "active" : ""}`}
                          onClick={(e) => handleCountrySelect(countryItem, e)}
                        >{`${countryItem.flag} +${countryItem.phoneCode} - ${countryItem.title}`}</div>
                      </React.Fragment>
                    );
                  })
                ) : (
                  <div style={{ padding: "12px", textAlign: "center", color: "#6b7280", fontSize: "14px" }}>No countries found</div>
                )}
              </div>
            </div>
          )}
        </CountryCode>
        <Input
          disabled={props.disabled ?? false}
          onKeyDown={handleKeyDown1} // Attach the onKeyDown event handler
          onWheel={(e) => e.target.blur()}
          autoComplete="on"
          theme={themeColors}
          className={`input phone${country.phoneCode?.toString().length} ${value1?.toString().length > 0 ? "" : ""}`}
          placeholder={props.label}
          type="number"
          value={value1}
          onChange={(event) => props.onChange(event, props.id, props.type, props.sub, country)}
          min={0}
          max={Math.pow(10, country.PhoneNumberLength) - 1}
          name={props.name}
        />
      </div>
      <ErrorLabel error={props.error} info={props.info} />
      <Footnote {...props} />
    </InputContainer>
  );
};
