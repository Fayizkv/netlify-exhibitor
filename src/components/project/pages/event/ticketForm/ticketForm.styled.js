import styled from "styled-components";

export const SideBar = styled.div`
  width: 300px;
  overflow: auto;
  position: sticky;
  top: 0px;
  padding-top: 10px;
`;

export const Content = styled.div`
  width: calc(100% - 300px);
  border: 1px solid #e2e4e9;
  max-height: calc(100vh - 0px);
  overflow: auto;
  position: relative;
  iframe {
    width: 100%;
    bottom: 0;
    top: 0;
    margin-right: 10px;
    height: 100%;
    padding: 10px;
    position: absolute;
    border: 0;
  }
  &.fullscreen {
    position: fixed;
    inset: 0px;
    width: 100%;
    padding: 0px;
    background-color: white;
    overflow: auto;
  }
`;

export const LogoContainer = styled.div`
  width: 100%;
  height: 50px;
  background: linear-gradient(177deg, #a999ff 19.81%, #735afb 86.93%), linear-gradient(177deg, #a999ff 19.81%, #735afb 86.93%), #d9d9d9;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Logo = styled.img`
  aspect-ratio: 2.5;
  object-fit: auto;
  object-position: center;
  width: 121px;
  max-width: 100%;
`;

export const TabContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  border-bottom: 1px solid #d9d9d9;
  padding: 10px 5px;
`;

export const TabContent = styled.div`
  /* margin-top: 20px; */
`;

export const Button = styled.button`
  padding: 5px 15px;
  background-color: ${({ active }) => (active ? "#927efe" : "transparent")};
  color: ${({ active }) => (active ? "#ffffff" : "#000000")};
  border: none;
  cursor: pointer;
  outline: none;
  border-radius: 8px;
`;

export const DragBox = styled.div`
  /* width: 100%; */
  margin: 10px;
  height: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 15px;
  gap: 10px;
  color: #ababab;
  border-radius: 28px;
  border: 1px dashed black;
`;
